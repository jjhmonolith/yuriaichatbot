'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Search, QrCode, Download } from 'lucide-react';
import { usePassageSets } from '@/hooks/usePassageSets';
import { useTextbooks } from '@/hooks/useTextbooks';
import { PassageSet } from '@/types/common';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import PassageSetForm from '@/components/admin/PassageSetForm';

export default function PassageSetsPage() {
  const { passageSets, loading, error, createPassageSet, updatePassageSet, deletePassageSet, regenerateQRCode } = usePassageSets();
  const { textbooks } = useTextbooks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPassageSet, setEditingPassageSet] = useState<PassageSet | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPassageSets = passageSets.filter(set =>
    set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.passage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.textbookId as any)?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    try {
      setFormLoading(true);
      await createPassageSet(data.textbookId, data);
      setIsCreateModalOpen(false);
    } catch (error) {
      alert('지문세트 생성에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingPassageSet) return;
    
    try {
      setFormLoading(true);
      await updatePassageSet(editingPassageSet._id, data);
      setIsEditModalOpen(false);
      setEditingPassageSet(null);
    } catch (error) {
      alert('지문세트 수정에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (passageSet: PassageSet) => {
    if (!confirm(`"${passageSet.title}" 지문세트를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePassageSet(passageSet._id);
    } catch (error) {
      alert('지문세트 삭제에 실패했습니다.');
    }
  };

  const handleRegenerateQR = async (passageSet: PassageSet) => {
    if (!confirm(`"${passageSet.title}"의 QR 코드를 재생성하시겠습니까?`)) {
      return;
    }

    try {
      await regenerateQRCode(passageSet._id);
      alert('QR 코드가 재생성되었습니다.');
    } catch (error) {
      alert('QR 코드 재생성에 실패했습니다.');
    }
  };

  const handleDownloadQR = (passageSet: PassageSet) => {
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/admin/passage-sets/${passageSet._id}/qr-image`;
    link.download = `qr-${passageSet.title}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (passageSet: PassageSet) => {
    setEditingPassageSet(passageSet);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">지문세트 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">지문세트 관리</h1>
            <p className="mt-2 text-gray-600">
              QR 코드로 연결되는 학습 지문과 해설을 관리합니다.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>새 지문세트 추가</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="지문 제목, 내용, 교재명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Passage Sets List */}
      {filteredPassageSets.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">지문세트가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '새 지문세트를 추가해보세요.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 지문세트 추가
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPassageSets.map((passageSet) => (
            <div
              key={passageSet._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-6 w-6 rounded bg-green-100 flex items-center justify-center">
                        <FileText className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        Set {passageSet.setNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(passageSet.textbookId as any)?.title}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {passageSet.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {passageSet.passage.substring(0, 200)}...
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        생성일: {new Date(passageSet.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        QR: {passageSet.qrCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownloadQR(passageSet)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="QR 코드 다운로드"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRegenerateQR(passageSet)}
                      className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                      title="QR 코드 재생성"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(passageSet)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(passageSet)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 지문세트 추가"
        size="xl"
      >
        <PassageSetForm
          textbooks={textbooks}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPassageSet(null);
        }}
        title="지문세트 수정"
        size="xl"
      >
        {editingPassageSet && (
          <PassageSetForm
            passageSet={editingPassageSet}
            textbooks={textbooks}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingPassageSet(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>
    </div>
  );
}