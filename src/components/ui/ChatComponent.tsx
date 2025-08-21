"use client"
import React, { useEffect, useRef } from 'react'
import { Input } from './input'
import { Message, useChat } from '@ai-sdk/react';
import { Button } from './button';
import { Send } from 'lucide-react';
import MessageList from './MessageList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await axios.post<{ messages: Message[] }>("/api/get-messages", { chatId });
      return res.data.messages;
    }
  });
  
  const { input, handleInputChange, handleSubmit, messages, error, isLoading: isChatLoading } = useChat({
    api: "/api/chat-path", 
    body: {
      chatId,
    },
    headers: {
      "Content-Type": "application/json"
    },
    initialMessages: data || [],
    onError: (error) => {
      console.error("useChat error:", error);
      console.error("Error details:", {
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });
    },
    onResponse: (response) => {
      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        console.error("Response not OK:", response.status, response.statusText);
      }
    },
    onFinish: (message) => {
      console.log("Chat finished:", message);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show error if there's one
  if (error) {
    console.error("Chat error:", error);
  }

  return (
    <div className='h-full w-full flex flex-col'>
      {/* Header */}
      <div className='flex-shrink-0 p-4 border-b w-full'>
        <h3 className='text-xl font-bold'>Chat</h3>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto px-4 py-2 w-full'>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading chat history...</div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-800 text-sm">
                  Error: {error.message || "Something went wrong with the chat"}
                </p>
              </div>
            )}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t bg-white w-full">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2 w-full">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask any Question..."
              className="flex-1 min-w-0 !px-3 !py-2 !mb-2"
              disabled={isChatLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isChatLoading}
              className="!px-4 !py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 !min-w-2"
            >
              {isChatLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent