'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  
  // 어드민 페이지인지 확인
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAdminPage) {
    return children; // 어드민은 별도 레이아웃 사용
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
}