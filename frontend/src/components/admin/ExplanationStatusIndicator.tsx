'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface ExplanationStatusIndicatorProps {
  questionId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generatedAt?: Date;
  error?: string;
  onStatusChange?: (questionId: string, status: string) => void;
}

const ExplanationStatusIndicator: React.FC<ExplanationStatusIndicatorProps> = ({
  questionId,
  status,
  generatedAt,
  error,
  onStatusChange
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  useEffect(() => {
    // 백그라운드 작업 상태가 pending 또는 generating인 경우 폴링 시작
    if (currentStatus === 'pending' || currentStatus === 'generating') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [currentStatus]);

  const startPolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
        const response = await fetch(`${apiUrl}/admin/questions/${questionId}/explanation-status`);
        const result = await response.json();
        
        if (result.success) {
          const newStatus = result.data.status;
          setCurrentStatus(newStatus);
          
          if (onStatusChange) {
            onStatusChange(questionId, newStatus);
          }
          
          // 완료 상태면 폴링 중지
          if (newStatus === 'completed' || newStatus === 'failed') {
            setIsPolling(false);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 3000); // 3초마다 폴링

    // 컴포넌트 언마운트시 정리
    return () => {
      setIsPolling(false);
      clearInterval(interval);
    };
  };

  const stopPolling = () => {
    setIsPolling(false);
  };

  const getStatusDisplay = () => {
    switch (currentStatus) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          text: 'AI 해설 생성 대기중',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200'
        };
      case 'generating':
        return {
          icon: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
          text: 'AI 해설 생성중...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'AI 해설 생성 완료',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: `AI 해설 생성 실패${error ? `: ${error}` : ''}`,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'AI 해설 완료',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // 완료 상태에서는 표시하지 않음
  if (currentStatus === 'completed') {
    return null;
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
      {statusDisplay.icon}
      <span className={`text-xs font-medium ${statusDisplay.textColor}`}>
        {statusDisplay.text}
      </span>
      {generatedAt && currentStatus === 'completed' && (
        <span className="text-xs text-gray-500">
          {new Date(generatedAt).toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default ExplanationStatusIndicator;