'use client';

import { useState, useEffect } from 'react';
import { apiEndpoints } from '@/lib/api';
import { PassageSet } from '@/types/common';

export function useTextbookMappings(textbookId: string) {
  const [passageSets, setPassageSets] = useState<PassageSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.textbookMappings.list(textbookId);
      
      if (response.data.success) {
        setPassageSets(response.data.data.passageSets || []);
      } else {
        setError('교재 매핑 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('교재 매핑 목록을 불러오는데 실패했습니다.');
      console.error('Fetch textbook mappings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPassageSet = async (passageSetId: string) => {
    try {
      const response = await apiEndpoints.textbookMappings.add(textbookId, passageSetId);
      if (response.data.success) {
        await fetchMappings();
        return response.data.data;
      } else {
        throw new Error('지문세트 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('Add passage set error:', err);
      throw err;
    }
  };

  const removePassageSet = async (passageSetId: string) => {
    try {
      const response = await apiEndpoints.textbookMappings.remove(textbookId, passageSetId);
      if (response.data.success) {
        await fetchMappings();
        return true;
      } else {
        throw new Error('지문세트 제거에 실패했습니다.');
      }
    } catch (err) {
      console.error('Remove passage set error:', err);
      throw err;
    }
  };

  const reorderPassageSets = async (reorderData: { mappingId: string; newOrder: number }[]) => {
    try {
      const response = await apiEndpoints.textbookMappings.reorder(textbookId, { mappings: reorderData });
      if (response.data.success) {
        await fetchMappings();
        return true;
      } else {
        throw new Error('순서 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Reorder passage sets error:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (textbookId) {
      fetchMappings();
    }
  }, [textbookId]);

  return {
    passageSets,
    loading,
    error,
    fetchMappings,
    addPassageSet,
    removePassageSet,
    reorderPassageSets,
  };
}