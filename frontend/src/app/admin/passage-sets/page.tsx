'use client';

import { useState } from 'react';
import { usePassageSets } from '@/hooks/usePassageSets';
import { PassageSet } from '@/types/common';

export default function PassageSetsPage() {
  const { passageSets, loading, error, createPassageSet, updatePassageSet, deletePassageSet, regenerateQRCode } = usePassageSets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState<PassageSet | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createPassageSet(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create error:', error);
      alert('지문세트 생성에 실패했습니다.');
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedSet) return;
    
    try {
      await updatePassageSet(selectedSet._id, data);
      setShowEditModal(false);
      setSelectedSet(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('지문세트 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('지문세트를 삭제하시겠습니까?')) return;
    
    try {
      await deletePassageSet(id);
    } catch (error: any) {
      console.error('Delete error:', error);
      if (error.response?.status === 400) {
        alert('이 지문세트는 교재에서 사용 중이므로 삭제할 수 없습니다.');
      } else {
        alert('지문세트 삭제에 실패했습니다.');
      }
    }
  };

  const handleRegenerateQR = async (id: string) => {
    if (!confirm('QR 코드를 재생성하시겠습니까?')) return;
    
    try {
      await regenerateQRCode(id);
      alert('QR 코드가 재생성되었습니다.');
    } catch (error) {
      console.error('Regenerate QR error:', error);
      alert('QR 코드 재생성에 실패했습니다.');
    }
  };

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">지문세트 관리</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          새 지문세트 만들기
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용 교재
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QR 코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(passageSets || []).map((set) => (
              <tr key={set._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{set.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {set.passage.substring(0, 100)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {set.textbooks?.length ? (
                      <div>
                        {set.textbooks.map(tb => (
                          <div key={tb._id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                            {tb.title}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">사용 안함</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{set.qrCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(set.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSet(set);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleRegenerateQR(set._id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    QR 재생성
                  </button>
                  <button
                    onClick={() => handleDelete(set._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <PassageSetModal
          title="새 지문세트 만들기"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSet && (
        <PassageSetModal
          title="지문세트 수정"
          passageSet={selectedSet}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSet(null);
          }}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

function PassageSetModal({ 
  title, 
  passageSet, 
  onClose, 
  onSubmit 
}: {
  title: string;
  passageSet?: PassageSet;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: passageSet?.title || '',
    passage: passageSet?.passage || '',
    passageComment: passageSet?.passageComment || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              지문 내용
            </label>
            <textarea
              value={formData.passage}
              onChange={(e) => setFormData(prev => ({ ...prev, passage: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              지문 해설
            </label>
            <textarea
              value={formData.passageComment}
              onChange={(e) => setFormData(prev => ({ ...prev, passageComment: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {passageSet ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}