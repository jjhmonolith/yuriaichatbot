'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, Zap, Activity } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ExplanationStatusSummaryProps {
  setId: string;
  onStatusUpdate?: (summary: StatusSummary) => void;
}

interface StatusSummary {
  total: number;
  completed: number;
  generating: number;
  pending: number;
  failed: number;
}

interface QueueStatus {
  queueSize: number;
  isProcessing: boolean;
  oldestJob: string | null;
}

const ExplanationStatusSummary: React.FC<ExplanationStatusSummaryProps> = ({
  setId,
  onStatusUpdate
}) => {
  const [statusSummary, setStatusSummary] = useState<StatusSummary | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStatusSummary();
    fetchQueueStatus();
    
    // 백그라운드 작업이 있으면 폴링 시작 (자동 새로고침은 제거)
    // 사용자가 수동으로 새로고침 버튼을 클릭하여 상태 확인하도록 변경
  }, [setId]);

  const fetchStatusSummary = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/sets/${setId}/questions/explanation-status`);
      const result = await response.json();
      
      if (result.success) {
        const summary = result.data.summary;
        setStatusSummary(summary);
        
        if (onStatusUpdate) {
          onStatusUpdate(summary);
        }
      }
    } catch (error) {
      console.error('Status summary fetch error:', error);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/sets/${setId}/questions/queue-status`);
      const result = await response.json();
      
      if (result.success) {
        setQueueStatus(result.data);
      }
    } catch (error) {
      console.error('Queue status fetch error:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStatusSummary(),
        fetchQueueStatus()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!statusSummary) {
    return null;
  }

  const hasActiveGeneration = statusSummary.pending > 0 || statusSummary.generating > 0;
  const progress = statusSummary.total > 0 ? (statusSummary.completed / statusSummary.total) * 100 : 0;

  if (!hasActiveGeneration && statusSummary.failed === 0) {
    return null; // 모든 해설이 완료되었고 실패한 것도 없으면 표시하지 않음
  }

  return (
    <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI 해설 생성 진행 상황</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            {statusSummary.completed} / {statusSummary.total} 완료
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">{isRefreshing ? '새로고침 중...' : '새로고침'}</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>진행률</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {statusSummary.completed > 0 && (
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">완료: {statusSummary.completed}</span>
          </div>
        )}
        
        {statusSummary.generating > 0 && (
          <div className="flex items-center space-x-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">생성중: {statusSummary.generating}</span>
          </div>
        )}
        
        {statusSummary.pending > 0 && (
          <div className="flex items-center space-x-2 text-amber-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm">대기중: {statusSummary.pending}</span>
          </div>
        )}
        
        {statusSummary.failed > 0 && (
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">실패: {statusSummary.failed}</span>
          </div>
        )}
      </div>

      {/* Queue Status */}
      {queueStatus && (queueStatus.queueSize > 0 || queueStatus.isProcessing) && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>백그라운드 작업 큐</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>대기: {queueStatus.queueSize}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                queueStatus.isProcessing 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {queueStatus.isProcessing ? '처리중' : '대기'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {hasActiveGeneration && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <Zap className="inline h-4 w-4 mr-1" />
            AI가 백그라운드에서 문제 해설을 생성하고 있습니다. 위의 새로고침 버튼을 눌러 진행 상황을 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExplanationStatusSummary;