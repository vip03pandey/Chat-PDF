"use client"
import React, { useEffect, useRef } from 'react'
import { Input } from './input'
import { Message, useChat } from '@ai-sdk/react';
import { Button } from './button';
import { Send } from 'lucide-react';
import MessageList from './MessageList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Props={chatId:number}

const ChatComponent = ({chatId}:Props) => {
  const { data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await axios.post<{ messages: Message[] }>("/api/get-messages", { chatId });
      return res.data.messages;
    }
  });
  
  const {input,handleInputChange,handleSubmit,messages}=useChat({
    api:"/api/chat",
    body:{
      chatId,
    },
    initialMessages: data || [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='h-full w-full flex flex-col'>
      {/* Header */}
      <div className='flex-shrink-0 p-4 border-b w-full'>
        <h3 className='text-xl font-bold'>Chat</h3>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto px-4 py-2 w-full'>
        <MessageList messages={messages} />
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-4 border-t bg-white w-full !mb-4">
        <form onSubmit={handleSubmit} className="w-full ">
          <div className="flex gap-2 w-full">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask any Question..."
              className="flex-1 min-w-0 !p-2"
            />
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
            >
              <Send className="!w-10" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent