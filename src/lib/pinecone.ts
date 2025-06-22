import { Pinecone} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from 'md5';
import { convertToAscii } from "./utils";


let pinecone: Pinecone | null = null;


export const getPineconeClient = () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

type Vector = {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
};

type PDFPage={
    pageContent:string,
    metadata:{
        loc:{pageNumber:number}
    }
}

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    console.log('downloading from s3 into file system');
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
      console.log('file_name is null');
      throw new Error('Failed to download file from S3');
    }

    const loader = new PDFLoader(file_name);
    const pages = (await loader.load() as PDFPage[]);
    const documents=await Promise.all(pages.map(page=>prepareDocument(page)))
    const vectors=await Promise.all(documents.flat().map(doc=>embedDocuments(doc)))
    const client=getPineconeClient()
    const pineConeIndex=client.Index(process.env.PINECONE_INDEX!)
    await pineConeIndex.namespace(convertToAscii(fileKey)).upsert(vectors);
    return documents[0]
  }
    catch (error) {
    console.error('Error in loadS3IntoPinecone:', error);
    throw error; 
  }
}

export const truncateStringByBytes=(str:string,bytes:number)=>{
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
}



async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replaceAll(/\n/g, "");

  const splitter = new RecursiveCharacterTextSplitter();

  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}



async function embedDocuments(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    if (!embeddings) throw new Error("Failed to get embeddings");
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text as string,
        pageNumber: doc.metadata.pageNumber as number,
      },
    };
  } catch (error) {
    console.error("Error in embedDocuments:", error);
    throw error;
  }
}