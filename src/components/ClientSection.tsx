'use client'

import { useUser } from '@clerk/nextjs'
import FileUpload from './FileUpload'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function ClientSection() {
  const { isSignedIn } = useUser()

  return (
    <div className="w-full !mt-4">
      {isSignedIn ? (
        <FileUpload />
      ) : (
        <Link href='/sign-in'>
          <Button className="!px-4 !py-2">Login to get started <LogIn /></Button>
        </Link>
      )}
    </div>
  )
}
