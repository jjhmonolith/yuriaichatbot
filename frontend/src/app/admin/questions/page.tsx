'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, Edit, Trash2, HelpCircle, Search } from 'lucide-react';
import { useQuestions } from '@/hooks/useQuestions';
import { usePassageSets } from '@/hooks/usePassageSets';
import { Question } from '@/types/common';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import QuestionForm from '@/components/admin/QuestionForm';

export default function QuestionsPage() {
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const { questions, loading: questionsLoading, error, createQuestion, updateQuestion, deleteQuestion } = useQuestions(selectedSetId);
  const { passageSets, loading: setsLoading } = usePassageSets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const selectedSet = passageSets.find(set => set._id === selectedSetId);

  const handleCreate = async (data: any) => {
    if (!selectedSetId) return;
    
    try {
      setFormLoading(true);
      console.log('Creating question with data:', data);
      console.log('Selected set ID:', selectedSetId);
      const result = await createQuestion(data);
      console.log('Question created successfully:', result);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Question creation failed:', error);
      alert('문제 생성에 실패했습니다: ' + (error as Error).message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingQuestion) return;
    
    try {
      setFormLoading(true);
      await updateQuestion(editingQuestion._id, data);
      setIsEditModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      alert('문제 수정에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (question: Question) => {
    if (!confirm('이 문제를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteQuestion(question._id);
    } catch (error) {
      alert('문제 삭제에 실패했습니다.');
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  return (
    <div className="px-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">문제 관리</h1>
            <p className="mt-2 text-gray-600">
              지문세트별 문제와 해설을 관리합니다.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedSetId}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>새 문제 추가</span>
          </Button>
        </div>
      </div>

      {/* Set Selection */}
      <div className="mb-6">
        <label htmlFor="setSelect" className="block text-sm font-medium text-gray-700 mb-2">
          지문세트 선택
        </label>
        {setsLoading ? (
          <div className="text-sm text-gray-500">지문세트 목록을 불러오는 중...</div>
        ) : (
          <select
            id="setSelect"
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">지문세트를 선택하세요</option>
            {passageSets.map((set) => (
              <option key={set._id} value={set._id}>
                {set.textbooks && set.textbooks.length > 0 
                  ? `${set.textbooks[0].title} - ${set.title}` 
                  : set.title
                }
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Set Info */}
      {selectedSet && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            {selectedSet.title}
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            {selectedSet.textbooks && selectedSet.textbooks.length > 0 
              ? selectedSet.textbooks[0].title 
              : '독립 지문세트'
            }
          </p>
          <p className="text-xs text-blue-600 line-clamp-2">
            {selectedSet.passage.substring(0, 150)}...
          </p>
        </div>
      )}

      {/* Questions List */}
      {!selectedSetId ? (
        <div className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">지문세트를 선택하세요</h3>
          <p className="mt-1 text-sm text-gray-500">
            문제를 관리하려면 먼저 지문세트를 선택해주세요.
          </p>
        </div>
      ) : questionsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">문제 목록을 불러오는 중...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">문제가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            이 지문세트에 문제를 추가해보세요.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              새 문제 추가
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">
                          {question.questionNumber}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        문제 {question.questionNumber}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {question.questionText}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`flex items-center space-x-2 p-2 rounded ${
                            option === question.correctAnswer 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {String.fromCharCode(9312 + optionIndex)}
                          </span>
                          <span className={`text-sm ${
                            option === question.correctAnswer 
                              ? 'text-green-800 font-medium' 
                              : 'text-gray-700'
                          }`}>
                            {option}
                          </span>
                          {option === question.correctAnswer && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              정답
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-1">해설:</div>
                      <div className="prose max-w-none
                        [&>h1]:!text-lg [&>h1]:!font-bold [&>h1]:!text-blue-900 [&>h1]:mb-2 [&>h1]:mt-3
                        [&>h2]:!text-base [&>h2]:!font-bold [&>h2]:!text-blue-900 [&>h2]:mb-2 [&>h2]:mt-3  
                        [&>h3]:!text-sm [&>h3]:!font-semibold [&>h3]:!text-blue-900 [&>h3]:mb-1 [&>h3]:mt-2
                        [&>h4]:!text-sm [&>h4]:!font-semibold [&>h4]:!text-blue-900 [&>h4]:mb-1 [&>h4]:mt-2
                        [&>p]:text-sm [&>p]:text-blue-800 [&>p]:mb-2 [&>p]:leading-relaxed
                        [&>strong]:font-bold [&>strong]:text-blue-900
                        [&>em]:italic [&>em]:text-blue-700
                        [&>code]:text-xs [&>code]:text-purple-600 [&>code]:bg-purple-50 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded
                        [&>ul]:text-sm [&>ul]:text-blue-800 [&>ul]:mb-2 [&>ul]:pl-4
                        [&>ol]:text-sm [&>ol]:text-blue-800 [&>ol]:mb-2 [&>ol]:pl-4  
                        [&>li]:text-blue-800 [&>li]:mb-1
                        [&>blockquote]:border-l-4 [&>blockquote]:border-blue-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-blue-600">
                        <ReactMarkdown>{question.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openEditModal(question)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(question)}
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
        title="새 문제 추가"
        size="lg"
      >
        <QuestionForm
          passageSet={selectedSet}
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
          setEditingQuestion(null);
        }}
        title="문제 수정"
        size="lg"
      >
        {editingQuestion && (
          <QuestionForm
            question={editingQuestion}
            passageSet={selectedSet}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingQuestion(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>
    </div>
  );
}