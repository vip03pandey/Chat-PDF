import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

let pinecone: Pinecone | null = null;

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  const index = pinecone.Index("chatpdf");
  const namespace = index.namespace(convertToAscii(fileKey));

  try {
    const queryResult = await namespace.query({
      topK: 5,
      includeMetadata: true,
      vector: embeddings,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    return [];
  }
}


export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
    const qualifyingDocs=matches.filter(match=>match.score && match.score>0.3)
    type Metadata={
        text:string,
        pageNumber:number
    }
    let docs=qualifyingDocs.map(match=>(match.metadata as Metadata).text)
    return docs.join("\n\n").substring(0,3000)
}
