import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function downloadFromS3(file_key: string) {
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.S3_BUCKET_REGION!,
    });

    const s3 = new AWS.S3({
      params: { Bucket: process.env.S3_BUCKET_NAME! },
      region: process.env.S3_BUCKET_REGION!,
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();
    const tempDir = '/tmp/pdf';
    await fsPromises.mkdir(tempDir, { recursive: true }); 
    const file_name = path.join(tempDir, `-${Date.now()}.pdf`);
    fs.writeFileSync(file_name, obj.Body as Buffer); 
    return file_name;
  } catch (error) {
    console.error('S3 download error:', error);
    return null; 
  }
}