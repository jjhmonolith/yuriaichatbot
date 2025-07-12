'use client';

import React, { useState } from 'react';
import { PassageSet, Textbook } from '@/types/common';
import Button from '@/components/ui/Button';

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
        <label htmlFor="passageComment" className="block text-sm font-medium text-gray-700">
          지문 해설 *
        </label>
        <textarea
          name="passageComment"
          id="passageComment"
          rows={6}
          value={formData.passageComment}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.passageComment ? 'border-red-300' : ''
          }`}
          placeholder="지문에 대한 상세한 해설을 입력해주세요. (배경, 주제, 특징 등)"
        />
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