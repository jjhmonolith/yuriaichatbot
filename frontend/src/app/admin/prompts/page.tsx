'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Save, X, RotateCcw, History, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface SystemPrompt {
  _id: string;
  key: string;
  name: string;
  description: string;
  content: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface PromptVersion {
  version: number;
  content: string;
  createdAt: string;
  description: string;
  createdBy?: string;
  isCurrent: boolean;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedPromptForVersions, setSelectedPromptForVersions] = useState<SystemPrompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // 폼 상태
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    content: '',
    isActive: true,
    versionDescription: ''
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/system-prompts`);
      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.data.prompts);
      } else {
        setError('프롬프트 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Fetch prompts error:', error);
      setError('프롬프트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultPrompts = async () => {
    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/system-prompts/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`${data.data.length}개의 기본 프롬프트가 생성되었습니다.`);
        fetchPrompts();
      } else {
        alert('기본 프롬프트 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Initialize prompts error:', error);
      alert('기본 프롬프트 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const initializeIndividualPrompt = async (key: string, name: string) => {
    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/system-prompts/initialize/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message || `${name} 프롬프트가 초기화되었습니다.`);
        fetchPrompts();
      } else {
        alert(`${name} 프롬프트 초기화에 실패했습니다.`);
      }
    } catch (error) {
      console.error('Initialize individual prompt error:', error);
      alert(`${name} 프롬프트 초기화에 실패했습니다.`);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setEditForm({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
      isActive: prompt.isActive
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingPrompt(null);
    setIsEditModalOpen(false);
    setEditForm({
      name: '',
      description: '',
      content: '',
      isActive: true,
      versionDescription: ''
    });
  };

  // 버전 히스토리 모달 열기
  const openVersionModal = async (prompt: SystemPrompt) => {
    setSelectedPromptForVersions(prompt);
    setLoadingVersions(true);
    setIsVersionModalOpen(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/system-prompts/versions/${prompt.key}`);
      const data = await response.json();
      
      if (data.success) {
        const allVersions = [data.data.current, ...data.data.versions];
        setVersions(allVersions);
      } else {
        setVersions([]);
        alert('버전 데이터를 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('Fetch versions error:', error);
      setVersions([]);
      alert('버전 데이터를 불러오지 못했습니다.');
    } finally {
      setLoadingVersions(false);
    }
  };

  // 버전 히스토리 모달 닫기
  const closeVersionModal = () => {
    setIsVersionModalOpen(false);
    setSelectedPromptForVersions(null);
    setVersions([]);
  };

  // 특정 버전으로 되돌리기
  const revertToVersion = async (version: number) => {
    if (!selectedPromptForVersions) return;
    
    if (!confirm(`버전 ${version}으로 되돌리시겠습니까? 현재 내용이 새로운 버전으로 백업됩니다.`)) {
      return;
    }
    
    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/system-prompts/revert/${selectedPromptForVersions.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message || `버전 ${version}으로 성공적으로 되돌렸습니다.`);
        fetchPrompts();
        closeVersionModal();
      } else {
        alert('버전 되돌리기에 실패했습니다.');
      }
    } catch (error) {
      console.error('Revert version error:', error);
      alert('버전 되돌리기에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingPrompt) return;

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/system-prompts/${editingPrompt._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('프롬프트가 성공적으로 업데이트되었습니다.');
        fetchPrompts();
        closeEditModal();
      } else {
        alert('프롬프트 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Update prompt error:', error);
      alert('프롬프트 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">프롬프트 목록을 불러오는 중...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">프롬프트 관리</h1>
            <p className="mt-2 text-gray-600">
              AI 챗봇의 시스템 프롬프트를 관리하고 수정합니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={initializeDefaultPrompts}
              disabled={saving}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span>기본 프롬프트 생성</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Prompts List */}
      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">프롬프트가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            기본 프롬프트를 초기화하여 시작해보세요.
          </p>
          <div className="mt-6">
            <Button 
              onClick={initializeDefaultPrompts} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              기본 프롬프트 생성
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {prompts.map((prompt) => (
            <div
              key={prompt._id}
              className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                !prompt.isActive ? 'bg-gray-50 border-gray-200' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`h-6 w-6 rounded flex items-center justify-center ${
                        prompt.isActive ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <MessageSquare className={`h-3 w-3 ${
                          prompt.isActive ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {prompt.name}
                        </h3>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {prompt.key}
                        </span>
                      </div>
                      {!prompt.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          비활성
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {prompt.description}
                    </p>

                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <p className="text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {prompt.content.length > 300 
                          ? `${prompt.content.substring(0, 300)}...` 
                          : prompt.content
                        }
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>버전: v{prompt.version}</span>
                      <span>
                        수정일: {new Date(prompt.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openVersionModal(prompt)}
                      className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                      title="버전 관리"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(prompt)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title={`프롬프트 수정: ${editingPrompt?.name}`}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프롬프트 이름
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <input
              type="text"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프롬프트 내용
            </label>
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="프롬프트 내용을 입력하세요..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              버전 설명 (선택사항)
            </label>
            <input
              type="text"
              value={editForm.versionDescription}
              onChange={(e) => setEditForm(prev => ({ ...prev, versionDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 채팅 응답 업데이트, 버그 수정 등..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              활성화
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={closeEditModal}
              className="bg-gray-500 hover:bg-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={closeVersionModal}
        title={`버전 히스토리: ${selectedPromptForVersions?.name}`}
        size="xl"
      >
        <div className="space-y-4">
          {loadingVersions ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">버전 데이터를 불러오는 중...</div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">이전 버전이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                프롬프트를 수정하면 이전 버전이 저장됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {versions.map((version, index) => (
                <div
                  key={`${version.version}-${index}`}
                  className={`border rounded-lg p-4 ${
                    version.isCurrent 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-sm font-medium ${
                          version.isCurrent ? 'text-blue-800' : 'text-gray-800'
                        }`}>
                          버전 {version.version}
                        </span>
                        {version.isCurrent && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            현재 버전
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {version.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {version.description}
                        </p>
                      )}
                      
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap max-h-24 overflow-y-auto">
                          {version.content.length > 200 
                            ? `${version.content.substring(0, 200)}...` 
                            : version.content
                          }
                        </p>
                      </div>
                    </div>
                    
                    {!version.isCurrent && (
                      <div className="ml-4">
                        <Button
                          onClick={() => revertToVersion(version.version)}
                          disabled={saving}
                          className="text-xs bg-purple-600 hover:bg-purple-700"
                        >
                          <ArrowLeft className="h-3 w-3 mr-1" />
                          되돌리기
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={closeVersionModal}
              className="bg-gray-500 hover:bg-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}