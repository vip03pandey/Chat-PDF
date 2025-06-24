import { NextRequest, NextResponse } from 'next/server'
import AWS from 'aws-sdk'
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.S3_BUCKET_REGION!,
  })

  const s3 = new AWS.S3()
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const fileKey = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: file.type,
  }

  try {
    await s3.putObject(params).promise();
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileKey}`;
    return NextResponse.json({ fileKey, url });
  } catch (err: any) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
  
}


export function GET() {
  return NextResponse.json({ error: 'GET not supported' }, { status: 405 });
}