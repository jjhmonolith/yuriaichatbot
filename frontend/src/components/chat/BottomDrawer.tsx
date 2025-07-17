'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'passage' | 'questions' | null;
  passageData: any;
  children?: React.ReactNode;
}

export default function BottomDrawer({ 
  isOpen, 
  onClose, 
  type, 
  passageData, 
  children 
}: BottomDrawerProps) {
  const [height, setHeight] = useState(300); // 기본 높이
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(600); // 초기값
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const minHeight = 200;
  
  // 컴포넌트 마운트 시 maxHeight 설정 및 화면 크기 변경 감지
  useEffect(() => {
    const updateMaxHeight = () => {
      if (typeof window !== 'undefined') {
        setMaxHeight(window.innerHeight * 0.8);
      }
    };
    
    updateMaxHeight();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMaxHeight);
      return () => window.removeEventListener('resize', updateMaxHeight);
    }
  }, []);

  // 드래그 시작
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(height);
    
    // 드래그 중 선택 방지
    document.body.style.userSelect = 'none';
  };

  // 드래그 중
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY; // 위로 드래그시 양수
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    
    setHeight(newHeight);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  // 전체 화면 토글
  const toggleFullScreen = () => {
    setHeight(height === maxHeight ? 300 : maxHeight);
  };

  // 드래그 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, startY, startHeight]);

  // 드로어가 열릴 때 애니메이션
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.style.transform = 'translateY(0)';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* 드로어 */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 transform transition-transform duration-300"
        style={{ 
          height: `${height}px`,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        {/* 드래그 핸들 */}
        <div
          ref={dragHandleRef}
          className="relative bg-gray-50 rounded-t-xl border-b border-gray-200 cursor-row-resize"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* 드래그 인디케이터 */}
          <div className="flex items-center justify-center py-2">
            <GripHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {type === 'passage' ? '지문' : '문제'}
              </h3>
              <span className="text-sm text-gray-500">
                {type === 'passage' ? passageData?.set?.title : `총 ${passageData?.questions?.length || 0}개`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 전체화면 버튼 */}
              <button
                onClick={toggleFullScreen}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title={height === maxHeight ? '창 크기 줄이기' : '전체 화면'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {height === maxHeight ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4h6v5M9 15v5h6v-5M15 9h5v6h-5M4 9h5v6H4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M16 4h4v4M8 16H4v4h4M16 20h4v-4" />
                  )}
                </svg>
              </button>
              
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-hidden" style={{ height: `${height - 60}px` }}>
          {children}
        </div>
      </div>
    </>
  );
}