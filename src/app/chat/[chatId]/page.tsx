import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ChatSideBar from '@/components/ui/ChatSideBar'
type Props={
    params:{
        chatId:string
    }
}
const ChatPage = async (props:Props) => {
  const { chatId } = props.params;
  const {userId}=await auth()
  if(!userId){
    return redirect('/sign-in')
  }
  const _chats=await db.select().from(chats).where(eq(chats.userId,userId))
  if(!_chats.length){
    return redirect('/')
  }
  if (!_chats.find(chat => chat.id === parseInt(chatId))) {
    return redirect(`/`);
  }
  
  return (
    <div className='flex max-h-screen overflow-scroll'>
      <div className="flex h-screen">
    {/* Sidebar */}
    <div className="w-[300px] h-full ">
      <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
    </div>

      {/* Viewer */}
      <div className="flex-[5] p-4 overflow-auto">
        {/* <PDFViewer /> */}
      </div>

        {/* Chat */}
        <div className="flex-[3] border-l border-gray-300 overflow-auto">
          {/* <ChatComponent /> */}
        </div>
      </div>
      
    </div>
  )
}

export default ChatPage
