'use client';

import React, { useState } from 'react';
import { Question, PassageSet } from '@/types/common';
import Button from '@/components/ui/Button';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';

interface QuestionFormProps {
  question?: Question;
  passageSet?: PassageSet; // AI 해설 생성을 위해 지문세트 정보 필요
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function QuestionForm({ 
  question, 
  passageSet,
  onSubmit, 
  onCancel, 
  loading = false 
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    questionText: question?.questionText || '',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || '',
    explanation: question?.explanation || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
    
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ 
        ...prev, 
        options: newOptions,
        correctAnswer: newOptions.includes(prev.correctAnswer) ? prev.correctAnswer : ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = '문제를 입력해주세요.';
    }

    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      newErrors.options = '최소 2개의 선택지를 입력해주세요.';
    }

    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = '정답을 선택해주세요.';
    } else if (!formData.options.includes(formData.correctAnswer)) {
      newErrors.correctAnswer = '정답은 선택지 중 하나여야 합니다.';
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = '문제 해설을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateExplanation = async () => {
    // 필수 정보가 있는지 확인
    if (!formData.questionText.trim()) {
      alert('문제를 먼저 입력해주세요.');
      return;
    }
    
    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      alert('최소 2개의 선택지를 입력해주세요.');
      return;
    }
    
    if (!formData.correctAnswer.trim()) {
      alert('정답을 먼저 선택해주세요.');
      return;
    }
    
    if (!passageSet) {
      alert('지문 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      setIsGeneratingExplanation(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      const response = await fetch(`${apiUrl}/admin/commentary-generator/generate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageContent: passageSet.passage,
          passageComment: passageSet.passageComment,
          questionText: formData.questionText,
          options: validOptions,
          correctAnswer: formData.correctAnswer,
          existingExplanation: formData.explanation, // 기존 해설이 있으면 참고용으로 전달
          subject: '국어',
          level: '고등학교'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // AI가 생성한 해설로 대체
        setFormData(prev => ({ 
          ...prev, 
          explanation: data.data.explanation 
        }));
        
        // 해설 필드 에러가 있었다면 제거
        if (errors.explanation) {
          setErrors(prev => ({ ...prev, explanation: '' }));
        }
        
        alert('문제 해설이 성공적으로 생성되었습니다! 필요시 수정하여 사용하세요.');
      } else {
        throw new Error(data.message || '문제 해설 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Question explanation generation error:', error);
      alert('문제 해설 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // 빈 선택지 제거
      const validOptions = formData.options.filter(option => option.trim());
      
      await onSubmit({
        ...formData,
        options: validOptions
      });
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 문제 */}
      <div>
        <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
          문제 *
        </label>
        <textarea
          name="questionText"
          id="questionText"
          rows={3}
          value={formData.questionText}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.questionText ? 'border-red-300' : ''
          }`}
          placeholder="문제를 입력해주세요."
        />
        {errors.questionText && (
          <p className="mt-1 text-sm text-red-600">{errors.questionText}</p>
        )}
      </div>

      {/* 선택지 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            선택지 * (최소 2개, 최대 5개)
          </label>
          {formData.options.length < 5 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>선택지 추가</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 w-6">
                {String.fromCharCode(9312 + index)}
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder={`선택지 ${index + 1}`}
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="mt-1 text-sm text-red-600">{errors.options}</p>
        )}
      </div>

      {/* 정답 */}
      <div>
        <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">
          정답 *
        </label>
        <select
          name="correctAnswer"
          id="correctAnswer"
          value={formData.correctAnswer}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.correctAnswer ? 'border-red-300' : ''
          }`}
        >
          <option value="">정답을 선택하세요</option>
          {formData.options.map((option, index) => (
            option.trim() && (
              <option key={index} value={option}>
                {String.fromCharCode(9312 + index)} {option}
              </option>
            )
          ))}
        </select>
        {errors.correctAnswer && (
          <p className="mt-1 text-sm text-red-600">{errors.correctAnswer}</p>
        )}
      </div>

      {/* 해설 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">
            해설 *
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateExplanation}
            disabled={isGeneratingExplanation || !formData.questionText.trim() || !formData.correctAnswer.trim() || !passageSet}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
          >
            {isGeneratingExplanation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isGeneratingExplanation ? '생성 중...' : 'AI 해설 생성'}</span>
          </Button>
        </div>
        
        {/* 도움말 텍스트 */}
        {(!formData.questionText.trim() || !formData.correctAnswer.trim() || !passageSet) && (
          <p className="text-xs text-gray-500 mb-2">
            문제와 정답을 입력한 후 AI 해설을 생성할 수 있습니다.
          </p>
        )}
        
        <textarea
          name="explanation"
          id="explanation"
          rows={4}
          value={formData.explanation}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.explanation ? 'border-red-300' : ''
          }`}
          placeholder="정답에 대한 자세한 해설을 입력해주세요."
        />
        {errors.explanation && (
          <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
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
          {loading ? '저장 중...' : question ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}