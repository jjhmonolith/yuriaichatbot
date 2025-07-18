'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, MessageCircle, MessageSquare } from 'lucide-react';

interface PassageDrawerContentProps {
  passageData: any;
  onQuestionWithText?: (selectedText: string) => void;
}

export default function PassageDrawerContent({ passageData, onQuestionWithText }: PassageDrawerContentProps) {
  const [activeTab, setActiveTab] = useState<'passage' | 'commentary'>('passage');
  const [selectedText, setSelectedText] = useState('');
  const [showQuestionButton, setShowQuestionButton] = useState(false);
  const passageRef = useRef<HTMLDivElement>(null);

  // 텍스트 선택 감지
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selected = selection.toString().trim();
      setSelectedText(selected);
      setShowQuestionButton(true);
      
      // iOS에서 텍스트 선택 메뉴가 나타나는 것을 방지하기 위해 선택 해제
      setTimeout(() => {
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }
      }, 100);
    } else {
      setSelectedText('');
      setShowQuestionButton(false);
    }
  };

  // 선택된 텍스트로 질문하기
  const handleQuestionWithSelection = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedText && onQuestionWithText) {
      onQuestionWithText(selectedText);
      setSelectedText('');
      setShowQuestionButton(false);
      // 선택 해제
      window.getSelection()?.removeAllRanges();
    }
  };

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
            <div className="bg-gray-50 p-4 rounded-lg relative">
              <div 
                ref={passageRef}
                className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap select-text relative z-10"
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                style={{ 
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  WebkitTouchCallout: 'none'
                }}
              >
                {set?.passage || '지문 내용을 불러올 수 없습니다.'}
              </div>
            </div>
            
            
            {/* 도움말 텍스트 */}
            <div className="text-xs text-gray-500 px-2">
              💡 지문의 특정 부분을 드래그로 선택하면 해당 부분에 대해 질문할 수 있습니다.
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
      
      {/* 플로팅 질문하기 버튼 */}
      {showQuestionButton && (
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 animate-pop-in pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <button
            onClick={handleQuestionWithSelection}
            onTouchEnd={handleQuestionWithSelection}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-4 rounded-full text-sm font-medium
                       shadow-2xl hover:bg-blue-700 transition-all duration-200 backdrop-blur-sm
                       border-2 border-blue-500 cursor-pointer touch-manipulation min-h-[52px]
                       hover:scale-105 active:scale-95 pointer-events-auto select-none"
            style={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              zIndex: 10000
            }}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0 pointer-events-none" />
            <span className="whitespace-nowrap pointer-events-none select-none font-semibold">선택한 부분 질문하기</span>
          </button>
        </div>
      )}
    </div>
  );
}