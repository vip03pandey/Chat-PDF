import FileUpload from "@/components/FileUpload";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button"
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button>Button</Button>
    </div>
  )
}

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home(){
  const {userId} = await auth()
  const isAuth= !!userId
  return (
<AuroraBackground>
  <div className="z-10 pointer-events-auto px-4 md:px-16 py-8">
    <div className="absolute top-0 right-0 !mt-4 !mr-3 pointer-events-auto">
      <UserButton afterSignOutUrl="/" />
    </div>

    <div className="flex flex-col items-center text-center">
      <div className="flex items-center">
        <PointerHighlight
          rectangleClassName="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
          pointerClassName="text-blue-500"
        >
          <h1 className="mr-3 text-5xl font-semibold !p-2 relative z-10">
            Chat with any PDF
          </h1>
        </PointerHighlight>
      </div>

      <div className="!flex !mt-4">
        {isAuth && <Button className="!px-3 !py-2">Go to Chat</Button>}
      </div>

      <p className="max-w-xl !mt-1 text-lg text-slate-600">
        Join millions of students and professional to instantly answer
        questions and understand research with AI
      </p>

      <div className="w-full !mt-4">
        {isAuth ? (
          <FileUpload />
        ) : (
          <Link href="/sign-in">
            <Button className="!px-4 !py-2">
              Login to get started <LogIn />
            </Button>
          </Link>
        )}
      </div>
    </div>
  </div>
</AuroraBackground>

    
  )
}


