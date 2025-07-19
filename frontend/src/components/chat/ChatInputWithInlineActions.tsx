'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { SendHorizontal, BookOpen, HelpCircle, X } from 'lucide-react';

interface ChatInputWithInlineActionsProps {
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

export default function ChatInputWithInlineActions({ 
  onSend, 
  onOpenPassage,
  onOpenQuestions,
  disabled = false, 
  placeholder = "무엇이든 질문해보세요.",
  questionsCount = 0,
  initialMessage = '',
  reference = null,
  onClearReference
}: ChatInputWithInlineActionsProps) {
  const [message, setMessage] = useState(initialMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLFormElement>(null);

  // 입력창 높이를 --cih 변수에 바인딩
  useLayoutEffect(() => {
    const set = (h: number) =>
      document.documentElement.style.setProperty('--cih', `${h}px`);
    
    const el = wrapRef.current;
    if (!el) return;
    set(el.offsetHeight);
    
    const ro = new ResizeObserver(([e]) => set(e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // initialMessage가 변경될 때 message state 업데이트
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      // 다음 프레임에서 텍스트영역 높이 자동 조절
      setTimeout(() => {
        if (textareaRef.current) {
          adjustTextareaHeight();
        }
      }, 10);
    }
  }, [initialMessage]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

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
    
    // 자동 높이 조절
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  };

  return (
    <form
      ref={wrapRef}
      onSubmit={handleSubmit}
      className="fixed bottom-0 inset-x-0 z-10 w-full px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-md"
    >
      {/* 입력 상자 컨테이너 */}
      <div className="relative w-full">
        {/* 실제 textarea + 인라인 칩 + send 버튼 */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-2xl bg-[var(--cibg)] shadow-input
                     border border-white/20 px-4 py-3 pr-12 pt-9
                     focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400
                     transition disabled:opacity-50
                     text-[16px] leading-[1.4] placeholder:text-[16px]
                     text-gray-900 placeholder-gray-600"
          style={{ 
            minHeight: '44px', 
            maxHeight: '160px',
            lineHeight: '1.4',
            fontSize: '16px'
          }}
        />

        {/* 인라인 액션 버튼 그룹 (좌측 상단) */}
        <div className="absolute left-3 top-2 flex items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={onOpenPassage}
            disabled={disabled}
            className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200
                       flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5" />
            +지문
          </button>

          <button
            type="button"
            onClick={onOpenQuestions}
            disabled={disabled}
            className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200
                       flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            +문제
            {questionsCount > 0 && (
              <span className="ml-0.5 text-[10px] rounded-full bg-purple-300/60 px-1">
                {questionsCount}
              </span>
            )}
          </button>
        </div>

        {/* 선택 영역 참조 칩 (동적으로) */}
        {reference && (
          <div className="absolute left-[calc(3px+0.25rem)] bottom-2 flex items-center
                          gap-1 bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 text-xs
                          border border-blue-200">
            <span>참조 • {reference.type}</span>
            <button 
              onClick={onClearReference} 
              type="button"
              className="hover:text-blue-900 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 전송 버튼 (우측 하단) */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute right-2 bottom-2 w-9 h-9 rounded-full
                     bg-gradient-to-r from-purple-500 to-pink-600 text-white
                     flex items-center justify-center
                     hover:from-purple-600 hover:to-pink-700 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                     transform hover:scale-105"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}