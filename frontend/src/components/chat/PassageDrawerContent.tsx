'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, MessageCircle } from 'lucide-react';

interface PassageDrawerContentProps {
  passageData: any;
}

export default function PassageDrawerContent({ passageData }: PassageDrawerContentProps) {
  const [activeTab, setActiveTab] = useState<'passage' | 'commentary'>('passage');

  if (!passageData) return null;

  const { set } = passageData;

  return (
    <div className="h-full flex flex-col">
      {/* 탭 네비게이션 */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('passage')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'passage'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>지문</span>
        </button>
        <button
          onClick={() => setActiveTab('commentary')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'commentary'
              ? 'bg-white text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          disabled={!set?.passageComment}
        >
          <MessageCircle className="w-4 h-4" />
          <span>해설</span>
          {!set?.passageComment && (
            <span className="text-xs text-gray-400">(없음)</span>
          )}
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'passage' ? (
          <div className="space-y-4">
            {/* 지문 내용 - 제목 제거하여 지문 영역 확보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {set?.passage || '지문 내용을 불러올 수 없습니다.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 해설 내용 - 제목 제거하여 중복 방지 */}
            {set?.passageComment ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="prose max-w-none
                  [&>h1]:!text-base [&>h1]:!font-bold [&>h1]:!text-blue-900 [&>h1]:mb-2 [&>h1]:mt-3
                  [&>h2]:!text-sm [&>h2]:!font-bold [&>h2]:!text-blue-900 [&>h2]:mb-2 [&>h2]:mt-3  
                  [&>h3]:!text-xs [&>h3]:!font-semibold [&>h3]:!text-blue-900 [&>h3]:mb-1 [&>h3]:mt-2
                  [&>h4]:!text-xs [&>h4]:!font-semibold [&>h4]:!text-blue-900 [&>h4]:mb-1 [&>h4]:mt-2
                  [&>p]:text-sm [&>p]:text-blue-800 [&>p]:mb-2 [&>p]:leading-relaxed
                  [&>strong]:font-bold [&>strong]:text-blue-900
                  [&>em]:italic [&>em]:text-blue-700
                  [&>code]:text-xs [&>code]:text-purple-600 [&>code]:bg-purple-50 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded
                  [&>ul]:text-sm [&>ul]:text-blue-800 [&>ul]:mb-2 [&>ul]:pl-4 [&>ul]:list-disc
                  [&>ol]:text-sm [&>ol]:text-blue-800 [&>ol]:mb-2 [&>ol]:pl-4 [&>ol]:list-decimal
                  [&>li]:text-blue-800 [&>li]:mb-1 [&>li]:list-item
                  [&>blockquote]:border-l-4 [&>blockquote]:border-blue-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-blue-600">
                  <ReactMarkdown>{set.passageComment}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  해설이 없습니다
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}