'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTextbookMappings } from '@/hooks/useTextbookMappings';
import { usePassageSets } from '@/hooks/usePassageSets';
import { Textbook, PassageSet } from '@/types/common';
import { apiEndpoints } from '@/lib/api';

export default function TextbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const textbookId = params.id as string;
  
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { 
    passageSets: mappedSets, 
    loading: mappingsLoading, 
    addPassageSet, 
    removePassageSet, 
    reorderPassageSets 
  } = useTextbookMappings(textbookId);
  
  const { 
    passageSets: allSets, 
    loading: allSetsLoading 
  } = usePassageSets(); // 모든 독립적인 지문세트

  useEffect(() => {
    fetchTextbook();
  }, [textbookId]);

  const fetchTextbook = async () => {
    try {
      const response = await apiEndpoints.textbooks.get(textbookId);
      if (response.data.success) {
        setTextbook(response.data.data);
      }
    } catch (error) {
      console.error('Fetch textbook error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassageSet = async (passageSetId: string) => {
    try {
      await addPassageSet(passageSetId);
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Add passage set error:', error);
      if (error.response?.status === 400) {
        alert('이 지문세트는 이미 추가되어 있습니다.');
      } else {
        alert('지문세트 추가에 실패했습니다.');
      }
    }
  };

  const handleRemovePassageSet = async (passageSetId: string) => {
    if (!confirm('이 지문세트를 교재에서 제거하시겠습니까?')) return;
    
    try {
      await removePassageSet(passageSetId);
    } catch (error) {
      console.error('Remove passage set error:', error);
      alert('지문세트 제거에 실패했습니다.');
    }
  };

  const handleDownloadMappingQR = async (mappingId: string, qrCode: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/textbooks/${textbookId}/mappings/${mappingId}/qr-image`;
      console.log('QR Download URL:', url); // 디버깅용
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`QR 이미지를 가져올 수 없습니다. Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-${qrCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('QR 다운로드 오류:', error);
      alert('QR 코드 다운로드에 실패했습니다.');
    }
  };

  const handleMoveUp = async (set: PassageSet, index: number) => {
    if (index === 0) return;
    
    const reorderData = [
      { mappingId: set.mappingId!, newOrder: index },
      { mappingId: mappedSets[index - 1].mappingId!, newOrder: index + 1 }
    ];
    
    try {
      await reorderPassageSets(reorderData);
    } catch (error) {
      console.error('Reorder error:', error);
      alert('순서 변경에 실패했습니다.');
    }
  };

  const handleMoveDown = async (set: PassageSet, index: number) => {
    if (index === mappedSets.length - 1) return;
    
    const reorderData = [
      { mappingId: set.mappingId!, newOrder: index + 2 },
      { mappingId: mappedSets[index + 1].mappingId!, newOrder: index + 1 }
    ];
    
    try {
      await reorderPassageSets(reorderData);
    } catch (error) {
      console.error('Reorder error:', error);
      alert('순서 변경에 실패했습니다.');
    }
  };

  // 이미 매핑된 지문세트들을 제외한 사용 가능한 지문세트들
  const availableSets = allSets.filter(set => 
    !mappedSets.some(mapped => mapped._id === set._id)
  );

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (!textbook) return <div className="p-6">교재를 찾을 수 없습니다.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← 뒤로가기
          </button>
          <h1 className="text-2xl font-bold">{textbook.title}</h1>
          <p className="text-gray-600">{textbook.subject} | {textbook.level} | {textbook.year}년</p>
          {textbook.description && (
            <p className="text-gray-700 mt-2">{textbook.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={availableSets.length === 0}
        >
          지문세트 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">지문세트 목록</h2>
        </div>
        
        {mappingsLoading ? (
          <div className="p-6">로딩 중...</div>
        ) : mappedSets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            이 교재에 추가된 지문세트가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {mappedSets.map((set, index) => (
              <div key={set._id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-500">
                      {set.order || index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{set.title}</h3>
                      <p className="text-gray-600 text-sm truncate max-w-xl">
                        {set.passage.substring(0, 150)}...
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            교재용 QR: {set.mappingQrCode || '생성중...'}
                          </span>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            독립용 QR: {set.qrCode}
                          </span>
                          <span className="text-xs text-purple-600">
                            매핑 ID: {set.mappingId}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          생성일: {new Date(set.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMoveUp(set, index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(set, index)}
                    disabled={index === mappedSets.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  {set.mappingQrCode && (
                    <button
                      onClick={() => handleDownloadMappingQR(set.mappingId!, set.mappingQrCode!)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      QR 다운로드
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/admin/questions?setId=${set._id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    문제 관리
                  </button>
                  <button
                    onClick={() => handleRemovePassageSet(set._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Passage Set Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">지문세트 추가</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {allSetsLoading ? (
              <div className="p-6">로딩 중...</div>
            ) : availableSets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                추가할 수 있는 지문세트가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {availableSets.map((set) => (
                  <div 
                    key={set._id} 
                    className="border border-gray-200 rounded p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{set.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 truncate">
                          {set.passage.substring(0, 200)}...
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {set.qrCode}
                          </span>
                          <span className="text-xs text-gray-500">
                            생성일: {new Date(set.createdAt).toLocaleDateString()}
                          </span>
                          {set.textbooks && set.textbooks.length > 0 && (
                            <span className="text-xs text-blue-600">
                              {set.textbooks.length}개 교재에서 사용 중
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddPassageSet(set._id)}
                        className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}