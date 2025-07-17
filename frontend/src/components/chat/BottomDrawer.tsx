'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

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
  type DrawerSize = 'closed' | 'standard' | 'full';
  const [drawerSize, setDrawerSize] = useState<DrawerSize>('standard');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startSize, setStartSize] = useState<DrawerSize>('standard');
  const [maxHeight, setMaxHeight] = useState(600); // 초기값
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // 3단계 높이 정의
  const getHeight = (size: DrawerSize): number => {
    switch (size) {
      case 'closed':
        return 60; // 핸들만 보이는 높이
      case 'standard':
        return Math.min(400, maxHeight * 0.5); // 화면의 50% 또는 400px
      case 'full':
        return maxHeight; // 전체 높이
      default:
        return 400;
    }
  };
  
  // 컴포넌트 마운트 시 maxHeight 설정 및 화면 크기 변경 감지
  useEffect(() => {
    const updateMaxHeight = () => {
      if (typeof window !== 'undefined') {
        setMaxHeight(window.innerHeight); // 전체 화면 높이
      }
    };
    
    updateMaxHeight();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMaxHeight);
      return () => window.removeEventListener('resize', updateMaxHeight);
    }
  }, []);

  // 드로어가 열릴 때 초기 크기 설정
  useEffect(() => {
    if (isOpen) {
      setDrawerSize('standard');
    }
  }, [isOpen]);

  // 드래그 시작
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartSize(drawerSize);
    
    // 드래그 중 선택 방지
    if (typeof window !== 'undefined') {
      document.body.style.userSelect = 'none';
    }
  };

  // 드래그 중
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY; // 위로 드래그시 양수
    
    // 드래그 거리에 따라 단계 결정
    if (deltaY > 100) {
      // 위로 많이 드래그 -> 전체
      setDrawerSize('full');
    } else if (deltaY < -100) {
      // 아래로 많이 드래그 -> 닫기
      setDrawerSize('closed');
    } else if (Math.abs(deltaY) < 50) {
      // 작은 움직임 -> 표준
      setDrawerSize('standard');
    }
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
    if (typeof window !== 'undefined') {
      document.body.style.userSelect = '';
    }
    
    // 닫힌 상태에서는 드로어 완전히 닫기
    if (drawerSize === 'closed') {
      onClose();
    }
  };

  // 크기 조절 버튼들
  const handleSizeUp = () => {
    if (drawerSize === 'standard') {
      setDrawerSize('full');
    } else if (drawerSize === 'closed') {
      setDrawerSize('standard');
    }
  };

  const handleSizeDown = () => {
    if (drawerSize === 'full') {
      setDrawerSize('standard');
    } else if (drawerSize === 'standard') {
      setDrawerSize('closed');
    }
  };

  // 배경 클릭 시 닫기
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 드래그 이벤트 리스너
  useEffect(() => {
    if (typeof window === 'undefined' || !isDragging) return;
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, startY, startSize]);

  if (!isOpen) return null;

  const currentHeight = getHeight(drawerSize);

  return (
    <>
      {/* 투명 배경 (클릭 감지용) */}
      <div 
        className="fixed inset-0 z-40 transition-opacity duration-200"
        onClick={handleBackgroundClick}
      />
      
      {/* 드로어 */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 transform transition-all duration-300"
        style={{ 
          height: `${currentHeight}px`,
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
              {/* 크기 조절 버튼들 */}
              <button
                onClick={handleSizeUp}
                disabled={drawerSize === 'full'}
                className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
                title="크기 늘리기"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSizeDown}
                disabled={drawerSize === 'closed'}
                className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
                title="크기 줄이기"
              >
                <ChevronDown className="w-4 h-4" />
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
        <div className="flex-1 overflow-hidden" style={{ height: `${currentHeight - 60}px` }}>
          {children}
        </div>
      </div>
    </>
  );
}