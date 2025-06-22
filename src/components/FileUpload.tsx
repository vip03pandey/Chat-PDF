'use client';

import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import { Inbox, Loader2 } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AnimatedBeamDemo } from "@/components/ui/animatedbemo";

interface S3UploadResponse {
  file_key: string;
  file_name: string;
}

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

const FileUpload = () => {
  const router=useRouter()
  const [uploading, setUploading] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name }: { file_key: string; file_name: string }) => {
      const response = await axios.post('/api/create-chat', {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 10 MB');
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file) as S3UploadResponse;
        console.log('S3 response:', data);
        if (!data?.file_key || !data?.file_name) {
          toast.error('Missing file_key or file_name from S3 upload');
          return;
        }
        console.log('Calling mutate with:', data);
        mutate(data, {
          onSuccess: ({chat_id}) => {
            toast.success('File uploaded and processed successfully!');
            router.push(`/chat/${chat_id}`)
          },
          onError: (error: Error) => {
            toast.error(`Failed to process file: ${error.message}`);
            console.log(error)
          },
        });
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(`Error uploading file to S3: ${err.message}`);
      } finally {
        setUploading(false);
      }
    },
    maxFiles: 1,
  });

  return (
    <div className='p-2 bg-white rounded-xl'>
      <div
        {...getRootProps({
          className:
            'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col',
        })}
      >
        <input {...getInputProps()} />
        {(uploading || isPending) ? (
          <>
            {/* <Loader2 className='h-10 w-10 text-blue-500 animate-spin' />
            <p className='mt-2 text-sm text-slate-500'>Spilling Tea to GPT...</p> */}
            <AnimatedBeamDemo />
          </>
        ) : (
          <>
            <Inbox className='w-10 text-blue-500' />
            <p className='mt-2 text-sm text-slate-400'>Click or drag PDF here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;