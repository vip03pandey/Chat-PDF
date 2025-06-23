import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ResponsiveChatLayout from '@/components/ResponsiveChatLayout'

type Props = {
  params: {
    chatId: string
  }
}

const ChatPage = async (props: Props) => {
  const { chatId } = props.params;
  const { userId } = await auth()
  
  if (!userId) {
    return redirect('/sign-in')
  }
  
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
  
  if (!_chats.length) {
    return redirect('/')
  }
  
  if (!_chats.find(chat => chat.id === parseInt(chatId))) {
    return redirect(`/`);
  }

  const currentChat = _chats.find(chat => chat.id === parseInt(chatId));
  
  return (
    <ResponsiveChatLayout
      chats={_chats}
      chatId={parseInt(chatId)}
      currentChat={currentChat}
    />
  )
}

export default ChatPage