'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInputWithButtons from '@/components/chat/ChatInputWithButtons';
import BottomDrawer from '@/components/chat/BottomDrawer';
import PassageDrawerContent from '@/components/chat/PassageDrawerContent';
import QuestionsDrawerContent from '@/components/chat/QuestionsDrawerContent';
import Avatar from '@/components/chat/Avatar';
import { Loader2, AlertCircle, Bot } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  const { session, passageData, loading, error, sendingMessage, sendMessage } = useChat(qrCode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 드로어 상태 관리
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'passage' | 'questions' | null>(null);
  // 모바일 viewport 높이 관리
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  // 드로어 열기 함수들
  const openPassageDrawer = () => {
    setDrawerType('passage');
    setDrawerOpen(true);
  };
  
  const openQuestionsDrawer = () => {
    setDrawerType('questions');
    setDrawerOpen(true);
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
    // 드로어 타입을 즉시 리셋하여 버튼 클릭 문제 해결
    setDrawerType(null);
  };

  // 모바일 viewport 높이 관리
  useEffect(() => {
    const updateViewportHeight = () => {
      if (typeof window !== 'undefined') {
        // 실제 보이는 viewport 높이 계산
        const vh = window.innerHeight;
        const initialVh = window.screen.height;
        
        // 키보드가 열린 상태인지 감지 (높이가 20% 이상 줄어들면 키보드가 열린 것으로 간주)
        const heightDiff = initialVh - vh;
        const isKeyboardVisible = heightDiff > initialVh * 0.2;
        
        setViewportHeight(vh);
        setIsKeyboardOpen(isKeyboardVisible);
        
        // CSS 변수로 설정하여 전체 앱에서 사용 가능
        document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
        document.documentElement.style.setProperty('--keyboard-height', `${heightDiff}px`);
      }
    };

    updateViewportHeight();
    
    // 모바일에서 주소창 숨김/표시 등으로 인한 높이 변경 감지
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateViewportHeight);
      window.addEventListener('orientationchange', updateViewportHeight);
      // 모바일 브라우저에서 스크롤 시 주소창 변경 감지
      window.addEventListener('scroll', updateViewportHeight);
      
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('orientationchange', updateViewportHeight);
        window.removeEventListener('scroll', updateViewportHeight);
      };
    }
  }, []);

  // 메시지 추가 시 스크롤 하단으로
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages]);

  // 로딩 상태
  if (loading) {
    return (
      <div 
        className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center"
        style={{ 
          minHeight: viewportHeight || '100vh',
          height: viewportHeight || '100vh'
        }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">학습 자료를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div 
        className="bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center"
        style={{ 
          minHeight: viewportHeight || '100vh',
          height: viewportHeight || '100vh'
        }}
      >
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!session || !passageData) {
    return null;
  }

  return (
    <div 
      className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden"
      style={{ 
        minHeight: viewportHeight || '100vh',
        height: viewportHeight || '100vh'
      }}
    >
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-16 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div 
        className="max-w-4xl mx-auto flex flex-col relative z-10"
        style={{ 
          height: viewportHeight || '100vh'
        }}
      >

        {/* Chat Messages */}
        <div 
          className={`flex-1 overflow-y-auto p-4 space-y-4 perspective-800 ${
            isKeyboardOpen ? 'pb-2' : ''
          }`}
          style={{ 
            marginBottom: isKeyboardOpen ? '0' : '0'
          }}
        >
          {/* Welcome Message */}
          {session.messages.length === 0 && (
            <div className="text-center py-8 animate-pop-in">
              <div className="mx-auto mb-4">
                <Avatar mood="happy" size="lg" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                안녕하세요! 👋
              </h3>
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-purple-600">{passageData.set.title}</span>에 대해 궁금한 것이 있으면 언제든 질문해주세요!
              </p>
              <div className="text-sm text-gray-500">
                예: "이 지문의 주제가 무엇인가요?", "어려운 단어를 설명해주세요", "문제를 풀어주세요"
              </div>
            </div>
          )}

          {/* Messages */}
          {session.messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {/* Typing Indicator */}
          {sendingMessage && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2">
                <Avatar mood="thinking" size="sm" />
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md px-4 py-2 shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input with Buttons */}
        <div className={isKeyboardOpen ? 'mobile-keyboard-fix' : ''}>
          <ChatInputWithButtons
            onSend={sendMessage}
            onOpenPassage={openPassageDrawer}
            onOpenQuestions={openQuestionsDrawer}
            disabled={sendingMessage}
            placeholder="지문에 대해 궁금한 것을 질문해보세요..."
            questionsCount={passageData?.questions?.length || 0}
          />
        </div>
      </div>
      
      {/* Bottom Drawer */}
      <BottomDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        type={drawerType}
        passageData={passageData}
      >
        {drawerType === 'passage' && (
          <PassageDrawerContent passageData={passageData} />
        )}
        {drawerType === 'questions' && (
          <QuestionsDrawerContent questions={passageData?.questions || []} />
        )}
      </BottomDrawer>
    </div>
  );
}