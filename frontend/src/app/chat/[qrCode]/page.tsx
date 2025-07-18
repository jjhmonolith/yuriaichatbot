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
  const [initialMessage, setInitialMessage] = useState('');
  const [reference, setReference] = useState<{ text: string; type: string } | null>(null);
  
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

  // 선택된 텍스트로 질문하기
  const handleQuestionWithText = (selectedText: string, type: string = '지문') => {
    // 드로어 즉시 닫기
    setDrawerOpen(false);
    setDrawerType(null);
    
    // 참조 영역 설정 (입력창에 직접 넣지 않고 별도 영역에 표시)
    setReference({
      text: selectedText,
      type: type
    });
  };

  // 메시지 전송 후 initialMessage 초기화
  const handleSendMessage = (message: string, messageReference?: { text: string; type: string }) => {
    // 참조가 있으면 함께 전송
    if (messageReference) {
      const formattedMessage = `[참조: ${messageReference.type}] "${messageReference.text}"\n\n질문: ${message}`;
      sendMessage(formattedMessage);
      setReference(null); // 참조 초기화
    } else {
      sendMessage(message);
    }
    setInitialMessage(''); // 전송 후 initialMessage 초기화
  };

  // 참조 영역 초기화
  const handleClearReference = () => {
    setReference(null);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-16 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto min-h-screen flex flex-col relative z-10">

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 perspective-800 pb-1">
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
        <div className="flex-shrink-0">
          <ChatInputWithButtons
            onSend={handleSendMessage}
            onOpenPassage={openPassageDrawer}
            onOpenQuestions={openQuestionsDrawer}
            disabled={sendingMessage}
            placeholder="무엇이든 질문해보세요."
            questionsCount={passageData?.questions?.length || 0}
            initialMessage={initialMessage}
            reference={reference}
            onClearReference={handleClearReference}
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
          <PassageDrawerContent 
            passageData={passageData} 
            onQuestionWithText={handleQuestionWithText}
          />
        )}
        {drawerType === 'questions' && (
          <QuestionsDrawerContent questions={passageData?.questions || []} />
        )}
      </BottomDrawer>
    </div>
  );
}