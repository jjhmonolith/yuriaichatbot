'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Plus, Edit, Trash2, HelpCircle, Search, ArrowLeft, BookOpen } from 'lucide-react';
import { Question } from '@/types/common';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import QuestionForm from '@/components/admin/QuestionForm';

interface PassageSet {
  _id: string;
  title: string;
  passage: string;
  passageComment: string;
  textbooks?: Array<{
    _id: string;
    title: string;
    subject: string;
    level: string;
  }>;
}

export default function PassageSetQuestionsPage({ params }: { params: { setId: string } }) {
  const router = useRouter();
  const [passageSet, setPassageSet] = useState<PassageSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchPassageSetAndQuestions();
  }, [params.setId]);

  const fetchPassageSetAndQuestions = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      
      // 지문세트 정보 가져오기
      const setResponse = await fetch(`${apiUrl}/admin/passage-sets/${params.setId}`);
      const setData = await setResponse.json();
      
      if (!setData.success) {
        setError('지문세트를 찾을 수 없습니다.');
        return;
      }
      
      setPassageSet(setData.data);
      
      // 문제 목록 가져오기
      const questionsResponse = await fetch(`${apiUrl}/admin/sets/${params.setId}/questions`);
      const questionsData = await questionsResponse.json();
      
      if (questionsData.success) {
        setQuestions(questionsData.data.questions || []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      setFormLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/sets/${params.setId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success) {
        alert('문제가 성공적으로 생성되었습니다.');
        fetchPassageSetAndQuestions();
        setIsCreateModalOpen(false);
      } else {
        alert('문제 생성에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
      }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success) {
        alert('문제가 성공적으로 수정되었습니다.');
        fetchPassageSetAndQuestions();
        setIsEditModalOpen(false);
        setEditingQuestion(null);
      } else {
        alert('문제 수정에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Question update failed:', error);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/questions/${question._id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        alert('문제가 성공적으로 삭제되었습니다.');
        fetchPassageSetAndQuestions();
      } else {
        alert('문제 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Question delete failed:', error);
      alert('문제 삭제에 실패했습니다.');
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">로딩 중...</div>
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

  if (!passageSet) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">지문세트를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/admin/passage-sets')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            지문세트 목록으로
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">문제 관리</h1>
            <p className="mt-2 text-gray-600">
              &quot;{passageSet.title}&quot; 지문세트의 문제를 관리합니다.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>새 문제 추가</span>
          </Button>
        </div>
      </div>

      {/* Passage Set Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-900">
            {passageSet.title}
          </h3>
        </div>
        <p className="text-sm text-blue-700 mb-2">
          {passageSet.textbooks && passageSet.textbooks.length > 0 
            ? passageSet.textbooks[0].title 
            : '독립 지문세트'
          }
        </p>
        <p className="text-xs text-blue-600 line-clamp-2">
          {passageSet.passage.substring(0, 150)}...
        </p>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
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
          passageSet={passageSet}
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
            passageSet={passageSet}
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