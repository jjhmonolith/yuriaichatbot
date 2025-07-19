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
      className="fixed bottom-0 inset-x-0 z-10 w-full px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pointer-events-none"
    >
      {/* 입력 상자 컨테이너 */}
      <div className="relative w-full pointer-events-auto">
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
                     border border-white/25 px-4 py-4 pr-14 text-[15px]
                     focus:ring-2 focus:ring-purple-400/40 transition disabled:opacity-50
                     text-gray-900 placeholder-gray-600"
          style={{ 
            minHeight: '56px', 
            maxHeight: '180px',
            paddingTop: '2.25rem',
            paddingBottom: '3.75rem'
          }}
        />

        {/* 하단 액션 바 (+지문 / +문제 / ➤ 전송) */}
        <div className="absolute -bottom-9 left-0 right-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* +지문 */}
            <button 
              type="button" 
              onClick={onOpenPassage}
              disabled={disabled}
              className="flex items-center gap-1 bg-blue-100 text-blue-700
                         h-7 px-2 rounded-md text-[13px] font-medium hover:bg-blue-200
                         transition-colors disabled:opacity-50"
            >
              <BookOpen className="w-3.5 h-3.5" /> +지문
            </button>

            {/* +문제 */}
            <button 
              type="button" 
              onClick={onOpenQuestions}
              disabled={disabled}
              className="flex items-center gap-1 bg-purple-100 text-purple-700
                         h-7 px-2 rounded-md text-[13px] font-medium hover:bg-purple-200
                         transition-colors disabled:opacity-50"
            >
              <HelpCircle className="w-3.5 h-3.5" /> +문제
              {questionsCount > 0 && (
                <span className="ml-0.5 text-[10px] bg-purple-300/60 rounded-full px-1">
                  {questionsCount}
                </span>
              )}
            </button>
          </div>

          {/* 전송 */}
          <button 
            type="submit" 
            disabled={!message.trim() || disabled}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-pink-600
                       flex items-center justify-center text-white
                       hover:from-purple-600 hover:to-pink-700 active:scale-95
                       disabled:opacity-40 transition-all duration-200"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 선택 영역 참조 칩 (입력박스 위쪽) */}
        {reference && (
          <div className="absolute -top-6 left-0 flex items-center gap-1
                          bg-blue-50 text-blue-700 rounded-md px-2 py-0.5 text-xs
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

      </div>
    </form>
  );
}