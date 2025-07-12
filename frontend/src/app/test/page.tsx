'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      // 직접 fetch로 테스트
      const response = await fetch('http://localhost:5001/api/health');
      const data = await response.json();
      setResult(`✅ 성공: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTextbooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/textbooks');
      const data = await response.json();
      setResult(`✅ 교재 API 성공: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ 교재 API 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestTextbook = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/textbooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '테스트 교재',
          subject: '국어',
          level: '고1',
          description: '테스트용 교재입니다'
        })
      });
      const data = await response.json();
      setResult(`✅ 교재 생성 성공: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ 교재 생성 에러: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API 연결 테스트</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '테스트 중...' : '백엔드 연결 테스트'}
        </button>

        <button 
          onClick={testTextbooks}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '테스트 중...' : '교재 목록 API 테스트'}
        </button>

        <button 
          onClick={createTestTextbook}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? '테스트 중...' : '교재 생성 API 테스트'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">결과:</h3>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}