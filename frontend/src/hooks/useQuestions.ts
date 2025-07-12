'use client';

import { useState, useEffect } from 'react';
import { apiEndpoints, api } from '@/lib/api';
import { Question } from '@/types/common';

export function useQuestions(setId?: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!setId) {
      console.log('fetchQuestions: No setId provided, clearing questions');
      setQuestions([]);
      setLoading(false);
      return;
    }

    try {
      console.log('fetchQuestions: Fetching questions for setId:', setId);
      setLoading(true);
      const response = await apiEndpoints.questions.list(setId);
      console.log('fetchQuestions: API response:', response.data);
      
      if (response.data.success) {
        console.log('fetchQuestions: Setting questions:', response.data.data);
        setQuestions(response.data.data);
      } else {
        setError('문제 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('문제 목록을 불러오는데 실패했습니다.');
      console.error('Fetch questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (data: any) => {
    if (!setId) throw new Error('Set ID is required');
    
    try {
      console.log('useQuestions: Creating question for setId:', setId, 'with data:', data);
      const response = await apiEndpoints.questions.create(setId, data);
      console.log('useQuestions: API response:', response.data);
      if (response.data.success) {
        await fetchQuestions();
        return response.data.data;
      } else {
        throw new Error('문제 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Create question error:', err);
      throw err;
    }
  };

  const updateQuestion = async (id: string, data: any) => {
    try {
      const response = await apiEndpoints.questions.update(id, data);
      if (response.data.success) {
        await fetchQuestions();
        return response.data.data;
      } else {
        throw new Error('문제 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Update question error:', err);
      throw err;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const response = await apiEndpoints.questions.delete(id);
      if (response.data.success) {
        await fetchQuestions();
        return true;
      } else {
        throw new Error('문제 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete question error:', err);
      throw err;
    }
  };

  const reorderQuestions = async (questionIds: string[]) => {
    if (!setId) throw new Error('Set ID is required');
    
    try {
      const response = await api.put(`/admin/sets/${setId}/questions/reorder`, {
        questionIds
      });
      if (response.data.success) {
        setQuestions(response.data.data);
        return response.data.data;
      } else {
        throw new Error('문제 순서 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Reorder questions error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [setId]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  };
}