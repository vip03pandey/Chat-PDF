import React from 'react'
import { Message } from '@ai-sdk/react'
import { cn } from '@/lib/utils'

type Props = {
  messages: Message[]
}

const MessageList = ({ messages }: Props) => {
  if (!messages) return null

  return (
    <div className="flex flex-col gap-3 ">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn('flex w-full', {
            'justify-end': message.role === 'user',
            'justify-start': message.role === 'assistant',
          })}
        >
          <div
            className={cn(
              'rounded-lg !px-4 !py-2 max-w-[80%] text-sm break-words !mr-1.5 !ml-1',
              {
                'bg-blue-600 text-white': message.role === 'user',
                'bg-gray-200 text-gray-800': message.role === 'assistant',
              }
            )}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList