'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = 'lcTtDzPWgMdakoc';
const AUTH_KEY = 'admin_authenticated';

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 스토리지에서 인증 상태 확인
    const authStatus = sessionStorage.getItem(AUTH_KEY);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setError('');
    } else {
      setError('잘못된 패스워드입니다.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              관리자 로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              관리자 페이지에 접근하려면 패스워드를 입력하세요
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="password" className="sr-only">
                패스워드
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="관리자 패스워드"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 로그아웃 버튼 */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
      {children}
    </div>
  );
}