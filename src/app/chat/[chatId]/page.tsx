import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ChatSideBar from '@/components/ui/ChatSideBar'
import PDFViewer from '@/components/ui/PDFViewer'
import ChatComponent from '@/components/ui/ChatComponent'

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

  const currentChat = _chats.find(chat => chat.id === parseInt(chatId));
  
  return (
    <div className='flex h-screen overflow-hidden'>
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <div className="w-70 h-full overflow-y-auto flex-shrink-0">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>

        {/* Viewer */}
        <div className="w-120 border-l-4 border-l-slate-200 h-full flex flex-col flex-shrink-0">
          <ChatComponent chatId={parseInt(chatId)}/>
        </div>

        <div className="flex-1 h-full overflow-y-auto">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ''} />
        </div>

        {/* Chat */}
        
      </div>
    </div>
  )
}

export default ChatPage