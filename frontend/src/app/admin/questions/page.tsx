'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, HelpCircle, FileText } from 'lucide-react';

export default function QuestionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 3초 후 자동 리다이렉트
    const timer = setTimeout(() => {
      router.push('/admin/passage-sets');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="px-6 mx-auto max-w-7xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <HelpCircle className="h-8 w-8 text-purple-600" />
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            문제 관리가 변경되었습니다
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            이제 문제는 지문세트별로 관리됩니다.<br />
            지문세트 관리 페이지에서 각 지문세트의<br />
            &quot;문제 관리&quot; 버튼을 클릭해주세요.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/admin/passage-sets')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              지문세트 관리로 이동
            </button>
            
            <p className="text-sm text-gray-500">
              3초 후 자동으로 이동됩니다...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}