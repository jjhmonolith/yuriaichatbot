'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, BookOpen, HelpCircle } from 'lucide-react';

interface ChatInputWithButtonsProps {
  onSend: (message: string) => void;
  onOpenPassage: () => void;
  onOpenQuestions: () => void;
  disabled?: boolean;
  placeholder?: string;
  questionsCount?: number;
}

export default function ChatInputWithButtons({ 
  onSend, 
  onOpenPassage,
  onOpenQuestions,
  disabled = false, 
  placeholder = "궁금한 것을 질문해보세요...",
  questionsCount = 0
}: ChatInputWithButtonsProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      
      // 텍스트영역 높이 리셋
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // 자동 높이 조절
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-4">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Quick suggestions (optional) */}
          {message === '' && (
            <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMessage('이 지문의 주제가 무엇인가요?')}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                주제 설명
              </button>
              <button
                type="button"
                onClick={() => setMessage('어려운 단어의 뜻을 알려주세요.')}
                className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
              >
                단어 뜻
              </button>
              <button
                type="button"
                onClick={() => setMessage('문제를 풀어주세요.')}
                className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
              >
                문제 풀이
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* 지문/문제 버튼 */}
      <div className="px-4 pb-4 flex space-x-3">
        <button
          onClick={onOpenPassage}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">지문</span>
        </button>
        
        <button
          onClick={onOpenQuestions}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">문제</span>
          {questionsCount > 0 && (
            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full ml-1">
              {questionsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}