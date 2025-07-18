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
    <div className="glass-morphism border-t border-white/20 backdrop-blur-md">
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
            className="w-full resize-none rounded-xl border border-white/30 px-4 py-3 pr-12 
                       bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-600
                       focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 
                       disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-300
                       shadow-lg hover:shadow-xl"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Quick suggestions (glassmorphism style) */}
          {message === '' && (
            <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMessage('이 지문의 주제가 무엇인가요?')}
                className="px-3 py-1 text-xs bg-blue-400/20 text-blue-700 rounded-full 
                          hover:bg-blue-400/30 transition-all duration-300 backdrop-blur-sm
                          border border-blue-400/30 shadow-lg hover:shadow-xl"
              >
                주제 설명
              </button>
              <button
                type="button"
                onClick={() => setMessage('어려운 단어의 뜻을 알려주세요.')}
                className="px-3 py-1 text-xs bg-green-400/20 text-green-700 rounded-full 
                          hover:bg-green-400/30 transition-all duration-300 backdrop-blur-sm
                          border border-green-400/30 shadow-lg hover:shadow-xl"
              >
                단어 뜻
              </button>
              <button
                type="button"
                onClick={() => setMessage('문제를 풀어주세요.')}
                className="px-3 py-1 text-xs bg-purple-400/20 text-purple-700 rounded-full 
                          hover:bg-purple-400/30 transition-all duration-300 backdrop-blur-sm
                          border border-purple-400/30 shadow-lg hover:shadow-xl"
              >
                문제 풀이
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl 
                     hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl
                     transform hover:scale-105 active:scale-95"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* 지문/문제 버튼 (glassmorphism style) */}
      <div className="px-4 pb-4 flex space-x-3">
        <button
          onClick={onOpenPassage}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 
                     bg-blue-400/20 text-blue-700 rounded-lg hover:bg-blue-400/30 
                     transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                     min-h-[48px] border border-blue-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl
                     transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">지문</span>
        </button>
        
        <button
          onClick={onOpenQuestions}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 
                     bg-purple-400/20 text-purple-700 rounded-lg hover:bg-purple-400/30 
                     transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                     min-h-[48px] border border-purple-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl
                     transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">문제</span>
          {questionsCount > 0 && (
            <span className="text-xs bg-purple-500/30 text-purple-800 px-2 py-0.5 rounded-full ml-1 
                           backdrop-blur-sm border border-purple-500/30">
              {questionsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}