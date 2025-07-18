'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

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
  const [isClosing, setIsClosing] = useState(false);
  const [maxHeight, setMaxHeight] = useState(600); // 초기값
  const drawerRef = useRef<HTMLDivElement>(null);

  // 드로어 높이 계산 - 모바일에서 더 많은 공간 확보
  const getHeight = (): number => {
    // 모바일에서는 더 큰 높이 사용
    const isMobile = maxHeight < 768;
    if (isMobile) {
      return Math.min(maxHeight * 0.75, maxHeight - 100); // 모바일: 75%, 더 많은 상단 여백
    }
    return Math.min(maxHeight * 0.85, maxHeight - 50); // 데스크톱: 85%
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

  // 드로어가 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // 드로어 열릴 때 배경 스크롤 비활성화
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // 드로어 닫힐 때 배경 스크롤 복원
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
  }, [isOpen]);

  // 애니메이션과 함께 닫기
  const handleClose = () => {
    setIsClosing(true);
    // 애니메이션 시간 후 실제로 닫기
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 배경 클릭 시 애니메이션과 함께 닫기
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const currentHeight = getHeight();

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
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 transform transition-all duration-300 ease-out"
        style={{ 
          height: `${currentHeight}px`,
          transform: (isOpen && !isClosing) ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        {/* 헤더 영역 (닫기 버튼만) */}
        <div className="relative bg-gray-50 rounded-t-xl border-b border-gray-200 flex items-center justify-between px-4 py-2">
          {/* 제목 영역 */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {type === 'passage' ? (passageData?.set?.title || '지문') : '문제'}
            </h3>
          </div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div 
          className="flex-1 overflow-hidden" 
          style={{ height: `${currentHeight - 50}px` }}
        >
          {children}
        </div>
      </div>
    </>
  );
}