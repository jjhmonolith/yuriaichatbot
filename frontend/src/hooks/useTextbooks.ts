'use client';

import { useState, useEffect } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Textbook } from '@/types/common';

export function useTextbooks() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTextbooks = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.textbooks.list();
      if (response.data.success) {
        setTextbooks(response.data.data.textbooks);
      } else {
        setError('교재 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('교재 목록을 불러오는데 실패했습니다.');
      console.error('Fetch textbooks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTextbook = async (data: Omit<Textbook, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiEndpoints.textbooks.create(data);
      if (response.data.success) {
        await fetchTextbooks(); // 목록 새로고침
        return response.data.data;
      } else {
        throw new Error('교재 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Create textbook error:', err);
      throw err;
    }
  };

  const updateTextbook = async (id: string, data: Partial<Textbook>) => {
    try {
      const response = await apiEndpoints.textbooks.update(id, data);
      if (response.data.success) {
        await fetchTextbooks(); // 목록 새로고침
        return response.data.data;
      } else {
        throw new Error('교재 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Update textbook error:', err);
      throw err;
    }
  };

  const deleteTextbook = async (id: string) => {
    try {
      const response = await apiEndpoints.textbooks.delete(id);
      if (response.data.success) {
        await fetchTextbooks(); // 목록 새로고침
        return true;
      } else {
        throw new Error('교재 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete textbook error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTextbooks();
  }, []);

  return {
    textbooks,
    loading,
    error,
    fetchTextbooks,
    createTextbook,
    updateTextbook,
    deleteTextbook,
  };
}