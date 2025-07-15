'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/lib/storage';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Message */}
        <div className={`relative px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div className="prose max-w-none
              [&>h1]:!text-xl [&>h1]:!font-bold [&>h1]:!text-gray-900 [&>h1]:mb-3 [&>h1]:mt-4
              [&>h2]:!text-lg [&>h2]:!font-bold [&>h2]:!text-gray-900 [&>h2]:mb-2 [&>h2]:mt-3  
              [&>h3]:!text-base [&>h3]:!font-semibold [&>h3]:!text-gray-900 [&>h3]:mb-2 [&>h3]:mt-3
              [&>h4]:!text-sm [&>h4]:!font-semibold [&>h4]:!text-gray-900 [&>h4]:mb-1 [&>h4]:mt-2
              [&>p]:text-sm [&>p]:text-gray-900 [&>p]:mb-2 [&>p]:leading-relaxed
              [&>strong]:font-bold [&>strong]:text-gray-900
              [&>em]:italic [&>em]:text-gray-700
              [&>code]:text-xs [&>code]:text-purple-600 [&>code]:bg-purple-50 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded
              [&>ul]:text-sm [&>ul]:text-gray-900 [&>ul]:mb-2 [&>ul]:pl-6 [&>ul]:list-disc
              [&>ol]:text-sm [&>ol]:text-gray-900 [&>ol]:mb-2 [&>ol]:pl-6 [&>ol]:list-decimal
              [&>li]:text-gray-900 [&>li]:mb-1 [&>li]:list-item
              [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:text-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}