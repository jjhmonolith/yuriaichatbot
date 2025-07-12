'use client';

import React, { useState } from 'react';
import { PassageSet, Textbook } from '@/types/common';
import Button from '@/components/ui/Button';
import { Sparkles, Loader2 } from 'lucide-react';

interface PassageSetFormProps {
  passageSet?: PassageSet;
  textbooks: Textbook[];
  selectedTextbookId?: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PassageSetForm({ 
  passageSet, 
  textbooks,
  selectedTextbookId,
  onSubmit, 
  onCancel, 
  loading = false 
}: PassageSetFormProps) {
  const [formData, setFormData] = useState({
    textbookId: selectedTextbookId || passageSet?.textbookId || '',
    title: passageSet?.title || '',
    passage: passageSet?.passage || '',
    passageComment: passageSet?.passageComment || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.textbookId) {
      newErrors.textbookId = '교재를 선택해주세요.';
    }

    if (!formData.title.trim()) {
      newErrors.title = '지문 제목을 입력해주세요.';
    }

    if (!formData.passage.trim()) {
      newErrors.passage = '지문 내용을 입력해주세요.';
    }

    if (!formData.passageComment.trim()) {
      newErrors.passageComment = '지문 해설을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateCommentary = async () => {
    // 제목과 지문 내용이 있는지 확인
    if (!formData.title.trim()) {
      alert('지문 제목을 먼저 입력해주세요.');
      return;
    }
    
    if (!formData.passage.trim()) {
      alert('지문 내용을 먼저 입력해주세요.');
      return;
    }

    try {
      setIsGeneratingCommentary(true);
      
      // 선택된 교재 정보 가져오기
      const selectedTextbook = textbooks.find(t => t._id === formData.textbookId);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/commentary-generator/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          passage: formData.passage,
          existingCommentary: formData.passageComment, // 기존 해설이 있으면 참고용으로 전달
          subject: selectedTextbook?.subject || '국어',
          level: selectedTextbook?.level || '고등학교'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // AI가 생성한 해설로 대체
        setFormData(prev => ({ 
          ...prev, 
          passageComment: data.data.commentary 
        }));
        
        // 해설 필드 에러가 있었다면 제거
        if (errors.passageComment) {
          setErrors(prev => ({ ...prev, passageComment: '' }));
        }
        
        alert('해설이 성공적으로 생성되었습니다! 필요시 수정하여 사용하세요.');
      } else {
        throw new Error(data.message || '해설 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Commentary generation error:', error);
      alert('해설 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingCommentary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 교재 선택 */}
      <div>
        <label htmlFor="textbookId" className="block text-sm font-medium text-gray-700">
          교재 *
        </label>
        <select
          name="textbookId"
          id="textbookId"
          value={formData.textbookId}
          onChange={handleChange}
          disabled={!!selectedTextbookId || !!passageSet}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.textbookId ? 'border-red-300' : ''
          } ${(selectedTextbookId || passageSet) ? 'bg-gray-50' : ''}`}
        >
          <option value="">교재를 선택하세요</option>
          {textbooks.map((textbook) => (
            <option key={textbook._id} value={textbook._id}>
              {textbook.title} ({textbook.subject} - {textbook.level})
            </option>
          ))}
        </select>
        {errors.textbookId && (
          <p className="mt-1 text-sm text-red-600">{errors.textbookId}</p>
        )}
      </div>

      {/* 지문 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          지문 제목 *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.title ? 'border-red-300' : ''
          }`}
          placeholder="예: 현대소설 - 운수좋은날"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* 지문 내용 */}
      <div>
        <label htmlFor="passage" className="block text-sm font-medium text-gray-700">
          지문 내용 *
        </label>
        <textarea
          name="passage"
          id="passage"
          rows={10}
          value={formData.passage}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.passage ? 'border-red-300' : ''
          }`}
          placeholder="학습할 지문의 전체 내용을 입력해주세요."
        />
        {errors.passage && (
          <p className="mt-1 text-sm text-red-600">{errors.passage}</p>
        )}
      </div>

      {/* 지문 해설 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="passageComment" className="block text-sm font-medium text-gray-700">
            지문 해설 *
          </label>
          <Button
            type="button"
            onClick={handleGenerateCommentary}
            disabled={isGeneratingCommentary || loading || !formData.title.trim() || !formData.passage.trim()}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-sm px-3 py-1.5"
          >
            {isGeneratingCommentary ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>AI 해설 생성</span>
              </>
            )}
          </Button>
        </div>
        <div className="relative">
          <textarea
            name="passageComment"
            id="passageComment"
            rows={8}
            value={formData.passageComment}
            onChange={handleChange}
            disabled={isGeneratingCommentary}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.passageComment ? 'border-red-300' : ''
            } ${isGeneratingCommentary ? 'bg-gray-50' : ''}`}
            placeholder="지문에 대한 상세한 해설을 입력하거나 'AI 해설 생성' 버튼을 클릭하세요."
          />
          {isGeneratingCommentary && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center rounded-md">
              <div className="flex items-center space-x-2 text-purple-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">AI가 해설을 생성 중입니다...</span>
              </div>
            </div>
          )}
        </div>
        {!formData.title.trim() || !formData.passage.trim() ? (
          <p className="mt-1 text-xs text-gray-500">
            💡 AI 해설 생성을 위해 지문 제목과 내용을 먼저 입력해주세요.
          </p>
        ) : formData.passageComment.trim() ? (
          <p className="mt-1 text-xs text-blue-600">
            💡 기존 해설이 있어 AI가 이를 참고하여 개선된 해설을 생성합니다.
          </p>
        ) : (
          <p className="mt-1 text-xs text-green-600">
            ✨ AI 해설 생성 준비가 완료되었습니다.
          </p>
        )}
        {errors.passageComment && (
          <p className="mt-1 text-sm text-red-600">{errors.passageComment}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? '저장 중...' : passageSet ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}