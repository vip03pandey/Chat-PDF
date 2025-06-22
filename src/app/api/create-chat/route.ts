import { NextResponse } from 'next/server';
import { loadS3IntoPinecone } from '@/lib/pinecone';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { chats } from '@/lib/db/schema'; // ensure this is defined

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { file_key, file_name } = body;

    console.log('Received in API:', file_key, file_name);

    await loadS3IntoPinecone(file_key);

    const chat_id=await db.insert(chats).values({
      fileKey:file_key,
      pdfName: file_name,
      pdfUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${file_key}`,
      userId,
    }).returning({
      insertedId: chats.id,
    })
    return NextResponse.json({ chat_id:chat_id[0].insertedId },{status:200})
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
