import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { chats } from '@/lib/db/schema';

export const runtime = "nodejs"; 

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { file_key, file_name } = body;

    if (!file_key || !file_name) {
      return NextResponse.json({ error: 'Missing file_key or file_name' }, { status: 400 });
    }

    console.log('✅ Received upload info:', file_key, file_name);
    const chatInsert = await db.insert(chats).values({
      fileKey: file_key,
      pdfName: file_name,
      pdfUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${file_key}`,
      userId,
    }).returning({
      insertedId: chats.id,
    });

    const chat_id = chatInsert[0].insertedId;
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_key }),
    }).then(() => {
      console.log('📤 Started background processing of:', file_key);
    }).catch((err) => {
      console.error('❌ Error triggering background job:', err);
    });
    return NextResponse.json({ chat_id }, { status: 200 });

  } catch (err) {
    console.error('❌ Internal error in /api/create-chat:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
