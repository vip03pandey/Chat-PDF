// lib/s3.ts
export async function uploadToS3(file: File) {
  console.log('Uploading file:', file.name);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('API response:', data);
    if (!response.ok) {
      throw new Error(data.error || 'S3 upload failed');
    }
    return {
      file_key: data.fileKey,
      file_name: file.name, 
    };
  } catch (error) {
    console.error('uploadToS3 error:', error);
    throw error;
  }
}