'use client';

import React, { useState } from 'react';
import { Textbook } from '@/types/common';
import Button from '@/components/ui/Button';

interface TextbookFormProps {
  textbook?: Textbook;
  onSubmit: (data: Omit<Textbook, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function TextbookForm({ 
  textbook, 
  onSubmit, 
  onCancel, 
  loading = false 
}: TextbookFormProps) {
  const [formData, setFormData] = useState({
    title: textbook?.title || '',
    subject: textbook?.subject || '국어',
    level: textbook?.level || '고등',
    year: textbook?.year || new Date().getFullYear(),
    description: textbook?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '교재명을 입력해주세요.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '과목을 선택해주세요.';
    }

    if (!formData.level.trim()) {
      newErrors.level = '학년을 선택해주세요.';
    }

    if (!formData.year || formData.year < 2000 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = '올바른 출간년도를 입력해주세요.';
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
      await onSubmit({
        ...formData,
        year: Number(formData.year),
      });
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 교재명 */}
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            교재명 *
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
            placeholder="예: 국어 문학 완성"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* 과목 */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            과목 *
          </label>
          <select
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.subject ? 'border-red-300' : ''
            }`}
          >
            <option value="국어">국어</option>
            <option value="영어">영어</option>
            <option value="수학">수학</option>
            <option value="과학">과학</option>
            <option value="사회">사회</option>
            <option value="기타">기타</option>
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* 학년 */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700">
            학년 *
          </label>
          <select
            name="level"
            id="level"
            value={formData.level}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.level ? 'border-red-300' : ''
            }`}
          >
            <option value="초등">초등</option>
            <option value="중등">중등</option>
            <option value="고등">고등</option>
          </select>
          {errors.level && (
            <p className="mt-1 text-sm text-red-600">{errors.level}</p>
          )}
        </div>

        {/* 출간년도 */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            출간년도 *
          </label>
          <input
            type="number"
            name="year"
            id="year"
            value={formData.year}
            onChange={handleChange}
            min="2000"
            max={new Date().getFullYear() + 1}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.year ? 'border-red-300' : ''
            }`}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
          )}
        </div>

        {/* 설명 */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="교재에 대한 간단한 설명을 입력해주세요."
          />
        </div>
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
          {loading ? '저장 중...' : textbook ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}