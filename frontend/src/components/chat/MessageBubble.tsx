'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/lib/storage';

interface MessageBubbleProps {
  message: ChatMessage;
  index?: number;
}

export default function MessageBubble({ message, index = 0 }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (isUser) {
    // 학생 메시지: 말풍선 형태 유지, 아바타 제거, 공간 최적화
    return (
      <div 
        className="flex justify-end mb-4 perspective-800"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex flex-col items-end max-w-sm lg:max-w-lg animate-pop-in">
          {/* User Message Bubble */}
          <div className="relative px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md shadow-lg hover:shadow-xl transform-style-3d transition-all duration-300 hover:animate-tilt-reverse">
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
            
            {/* Timestamp */}
            <div className="text-xs mt-2 text-blue-100 text-right">
              {time}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // AI 응답: 말풍선 제거, 전체 너비 플레인 텍스트
    return (
      <div 
        className="mb-6 animate-pop-in"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* AI Response - Full Width Text */}
        <div className="w-full">
          <div className="prose max-w-none text-gray-800
            [&>h1]:!text-xl [&>h1]:!font-bold [&>h1]:!text-gray-900 [&>h1]:mb-4 [&>h1]:mt-6
            [&>h2]:!text-lg [&>h2]:!font-bold [&>h2]:!text-gray-900 [&>h2]:mb-3 [&>h2]:mt-5  
            [&>h3]:!text-base [&>h3]:!font-semibold [&>h3]:!text-gray-900 [&>h3]:mb-2 [&>h3]:mt-4
            [&>h4]:!text-sm [&>h4]:!font-semibold [&>h4]:!text-gray-900 [&>h4]:mb-2 [&>h4]:mt-3
            [&>p]:text-base [&>p]:text-gray-800 [&>p]:mb-3 [&>p]:leading-relaxed
            [&>strong]:font-bold [&>strong]:text-gray-900
            [&>em]:italic [&>em]:text-gray-700
            [&>code]:text-sm [&>code]:text-purple-600 [&>code]:bg-purple-50 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded
            [&>ul]:text-base [&>ul]:text-gray-800 [&>ul]:mb-3 [&>ul]:pl-6 [&>ul]:list-disc
            [&>ol]:text-base [&>ol]:text-gray-800 [&>ol]:mb-3 [&>ol]:pl-6 [&>ol]:list-decimal
            [&>li]:text-gray-800 [&>li]:mb-1 [&>li]:list-item [&>li]:leading-relaxed
            [&>blockquote]:border-l-4 [&>blockquote]:border-purple-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-700 [&>blockquote]:bg-purple-50 [&>blockquote]:py-2 [&>blockquote]:rounded-r">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          
          {/* Timestamp */}
          <div className="text-xs mt-3 text-gray-500">
            AI 응답 • {time}
          </div>
        </div>
      </div>
    );
  }
}