'use client';

import React from 'react';

interface AvatarProps {
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ mood = 'neutral', size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const faces = {
    neutral: {
      mouth: 'M28 42 a6 6 0 1 0 12 0',
      eyes: 'M26 34 a2 2 0 1 0 4 0 M38 34 a2 2 0 1 0 4 0',
      eyebrows: 'M24 30 L32 30 M36 30 L44 30'
    },
    happy: {
      mouth: 'M26 38 q8 8 16 0',
      eyes: 'M26 34 a2 2 0 1 0 4 0 M38 34 a2 2 0 1 0 4 0',
      eyebrows: 'M24 30 L32 28 M36 28 L44 30'
    },
    thinking: {
      mouth: 'M28 42 q6 -3 12 0',
      eyes: 'M26 34 a2 2 0 1 0 4 0 M38 34 a2 2 0 1 0 4 0',
      eyebrows: 'M24 28 L32 30 M36 30 L44 28'
    },
    excited: {
      mouth: 'M24 36 q10 12 20 0',
      eyes: 'M26 32 a3 3 0 1 0 6 0 M36 32 a3 3 0 1 0 6 0',
      eyebrows: 'M22 26 L34 28 M34 28 L46 26'
    }
  };

  const currentFace = faces[mood];

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 68 68" 
        className="w-full h-full animate-float"
        role="img"
        aria-label={`AI 아바타 - ${mood} 상태`}
      >
        <defs>
          <radialGradient id="avatarGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </radialGradient>
          <radialGradient id="avatarGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* 배경 글로우 */}
        <circle 
          cx="34" 
          cy="34" 
          r="32" 
          fill="url(#avatarGlow)" 
          className="animate-pulse-glow"
        />
        
        {/* 메인 얼굴 */}
        <circle 
          cx="34" 
          cy="34" 
          r="28" 
          fill="url(#avatarGradient)" 
          filter="url(#glow)"
          className="transform-style-3d"
        />
        
        {/* 눈썹 */}
        <path 
          d={currentFace.eyebrows} 
          stroke="#ffffff" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
          opacity="0.9"
        />
        
        {/* 눈 */}
        <path 
          d={currentFace.eyes} 
          stroke="#ffffff" 
          strokeWidth="2.5" 
          fill="#ffffff"
          strokeLinecap="round"
        />
        
        {/* 입 */}
        <path 
          d={currentFace.mouth} 
          stroke="#ffffff" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* 반사광 효과 */}
        <ellipse 
          cx="28" 
          cy="28" 
          rx="4" 
          ry="6" 
          fill="rgba(255, 255, 255, 0.3)"
          transform="rotate(-45 28 28)"
        />
      </svg>
    </div>
  );
}