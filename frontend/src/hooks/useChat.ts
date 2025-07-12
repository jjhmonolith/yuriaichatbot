'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ChatStorage, ChatMessage, ChatSession } from '@/lib/storage';

export function useChat(qrCode: string) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [passageData, setPassageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // 지문 데이터 및 채팅 세션 초기화
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // 지문 데이터 가져오기
        const response = await api.get(`/chat/${qrCode}`);
        if (!response.data.success) {
          throw new Error('지문 데이터를 불러올 수 없습니다.');
        }
        
        const data = response.data.data;
        setPassageData(data);

        // 로컬 세션 가져오기 또는 생성
        let chatSession = ChatStorage.getSession(qrCode);
        if (!chatSession) {
          chatSession = ChatStorage.createSession(qrCode, data.set.title);
        }
        setSession(chatSession);

        // 오래된 세션 정리
        ChatStorage.cleanupOldSessions();
        
      } catch (err) {
        console.error('Initialize chat error:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      initializeChat();
    }
  }, [qrCode]);

  // 메시지 전송
  const sendMessage = async (content: string) => {
    if (!session || !passageData || sendingMessage) return;

    try {
      setSendingMessage(true);

      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: ChatStorage.generateMessageId(),
        type: 'user',
        content,
        timestamp: Date.now()
      };

      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage]
      };
      setSession(updatedSession);
      ChatStorage.saveSession(updatedSession);

      // AI 응답 요청
      const response = await api.post(`/chat/${qrCode}/message`, {
        message: content,
        context: {
          previousMessages: session.messages.slice(-5) // 최근 5개 메시지만 컨텍스트로 전송
        }
      });

      if (response.data.success) {
        // AI 응답 메시지 추가
        const aiMessage: ChatMessage = {
          id: ChatStorage.generateMessageId(),
          type: 'ai',
          content: response.data.data.response,
          timestamp: Date.now()
        };

        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, aiMessage]
        };
        setSession(finalSession);
        ChatStorage.saveSession(finalSession);
      } else {
        throw new Error('AI 응답을 받을 수 없습니다.');
      }
    } catch (err) {
      console.error('Send message error:', err);
      // 에러 메시지 추가
      const errorMessage: ChatMessage = {
        id: ChatStorage.generateMessageId(),
        type: 'ai',
        content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: Date.now()
      };

      // 에러 시에도 사용자 메시지가 이미 추가된 updatedSession을 기준으로 함
      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage]
      };
      setSession(errorSession);
      ChatStorage.saveSession(errorSession);
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    session,
    passageData,
    loading,
    error,
    sendingMessage,
    sendMessage
  };
}