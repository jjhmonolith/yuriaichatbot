'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInputWithButtons from '@/components/chat/ChatInputWithButtons';
import BottomDrawer from '@/components/chat/BottomDrawer';
import PassageDrawerContent from '@/components/chat/PassageDrawerContent';
import QuestionsDrawerContent from '@/components/chat/QuestionsDrawerContent';
import { Loader2, AlertCircle, Bot } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  const { session, passageData, loading, error, sendingMessage, sendMessage } = useChat(qrCode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 드로어 상태 관리
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'passage' | 'questions' | null>(null);
  
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
    // 약간의 딜레이 후 타입 리셋으로 상태 충돌 방지
    setTimeout(() => {
      setDrawerType(null);
    }, 100);
  };

  // 메시지 추가 시 스크롤 하단으로
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          {session.messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                안녕하세요! 👋
              </h3>
              <p className="text-gray-600 mb-4">
                <span className="font-medium text-blue-600">{passageData.set.title}</span>에 대해 궁금한 것이 있으면 언제든 질문해주세요!
              </p>
              <div className="text-sm text-gray-500">
                예: "이 지문의 주제가 무엇인가요?", "어려운 단어를 설명해주세요", "문제를 풀어주세요"
              </div>
            </div>
          )}

          {/* Messages */}
          {session.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {sendingMessage && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input with Buttons */}
        <ChatInputWithButtons
          onSend={sendMessage}
          onOpenPassage={openPassageDrawer}
          onOpenQuestions={openQuestionsDrawer}
          disabled={sendingMessage}
          placeholder="지문에 대해 궁금한 것을 질문해보세요..."
          questionsCount={passageData?.questions?.length || 0}
        />
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