'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BookOpen, HelpCircle, X } from 'lucide-react';

interface ChatInputWithButtonsProps {
  onSend: (message: string, reference?: { text: string; type: string }) => void;
  onOpenPassage: () => void;
  onOpenQuestions: () => void;
  disabled?: boolean;
  placeholder?: string;
  questionsCount?: number;
  initialMessage?: string;
  reference?: { text: string; type: string } | null;
  onClearReference?: () => void;
}

export default function ChatInputWithButtons({ 
  onSend, 
  onOpenPassage,
  onOpenQuestions,
  disabled = false, 
  placeholder = "궁금한 것을 질문해보세요...",
  questionsCount = 0,
  initialMessage = '',
  reference = null,
  onClearReference
}: ChatInputWithButtonsProps) {
  const [message, setMessage] = useState(initialMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // initialMessage가 변경될 때 message state 업데이트
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      // 다음 프레임에서 텍스트영역 높이 자동 조절 (DOM 업데이트 완료 후)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      }, 10);
    }
  }, [initialMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim(), reference || undefined);
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
    
    // 자동 높이 조절 - 더 정확한 계산을 위해 작은 지연 추가
    setTimeout(() => {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }, 0);
  };

  return (
    <div className="glass-morphism border-t border-white/20 backdrop-blur-md">
      {/* 참조 영역 배지 */}
      {reference && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">선택 영역 참조</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {reference.type}
              </span>
            </div>
            <button
              onClick={onClearReference}
              className="text-blue-400 hover:text-blue-600 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
            {reference.text.length > 100 ? `${reference.text.substring(0, 100)}...` : reference.text}
          </div>
        </div>
      )}
      
      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3 p-4">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="무엇이든 질문해보세요."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-white/30 px-4 py-3 
                       bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-600
                       focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 
                       disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-200
                       shadow-lg text-base placeholder:text-base chat-input-mobile"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl 
                     hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl
                     transform hover:scale-105 active:scale-95"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* 지문/문제 버튼 (glassmorphism style) */}
      <div className="px-4 pb-4 flex space-x-3">
        <button
          onClick={onOpenPassage}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 
                     bg-blue-400/20 text-blue-700 rounded-lg hover:bg-blue-400/30 
                     transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                     min-h-[40px] border border-blue-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl
                     transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <BookOpen className="w-4 h-4" />
          <span className="font-medium text-sm">지문</span>
        </button>
        
        <button
          onClick={onOpenQuestions}
          disabled={disabled}
          className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 
                     bg-purple-400/20 text-purple-700 rounded-lg hover:bg-purple-400/30 
                     transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                     min-h-[40px] border border-purple-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl
                     transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="font-medium text-sm">문제</span>
          {questionsCount > 0 && (
            <span className="text-xs bg-purple-500/30 text-purple-800 px-1.5 py-0.5 rounded-full ml-1 
                           backdrop-blur-sm border border-purple-500/30">
              {questionsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}