'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Search, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTextbooks } from '@/hooks/useTextbooks';
import { Textbook } from '@/types/common';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TextbookForm from '@/components/admin/TextbookForm';

export default function TextbooksPage() {
  const router = useRouter();
  const { textbooks, loading, error, createTextbook, updateTextbook, deleteTextbook } = useTextbooks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTextbook, setEditingTextbook] = useState<Textbook | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 필터링
  const filteredTextbooks = textbooks.filter(textbook =>
    textbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    textbook.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    textbook.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: Omit<Textbook, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setFormLoading(true);
      await createTextbook(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      alert('교재 생성에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: Omit<Textbook, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTextbook) return;
    
    try {
      setFormLoading(true);
      await updateTextbook(editingTextbook._id, data);
      setIsEditModalOpen(false);
      setEditingTextbook(null);
    } catch (error) {
      alert('교재 수정에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (textbook: Textbook) => {
    if (!confirm(`"${textbook.title}" 교재를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteTextbook(textbook._id);
    } catch (error) {
      alert('교재 삭제에 실패했습니다.');
    }
  };

  const openEditModal = (textbook: Textbook) => {
    setEditingTextbook(textbook);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">교재 목록을 불러오는 중...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">교재 관리</h1>
            <p className="mt-2 text-gray-600">
              교육 콘텐츠의 기본이 되는 교재를 관리합니다.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>새 교재 추가</span>
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
            placeholder="교재명, 과목, 설명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Textbooks Grid */}
      {filteredTextbooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">교재가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '새 교재를 추가해보세요.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 교재 추가
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTextbooks.map((textbook) => (
            <div
              key={textbook._id}
              className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {textbook.subject}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(textbook)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(textbook)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {textbook.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">학년:</span>
                    <span className="text-gray-900">{textbook.level}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">출간년도:</span>
                    <span className="text-gray-900">{textbook.year}년</span>
                  </div>
                </div>

                {textbook.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {textbook.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    생성일: {new Date(textbook.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/admin/textbooks/${textbook._id}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>지문세트 관리</span>
                  </button>
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
        title="새 교재 추가"
        size="lg"
      >
        <TextbookForm
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
          setEditingTextbook(null);
        }}
        title="교재 수정"
        size="lg"
      >
        {editingTextbook && (
          <TextbookForm
            textbook={editingTextbook}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingTextbook(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>
    </div>
  );
}