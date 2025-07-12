'use client';

import { useState, useEffect } from 'react';
import { apiEndpoints } from '@/lib/api';
import { PassageSet } from '@/types/common';

export function usePassageSets(textbookId?: string) {
  const [passageSets, setPassageSets] = useState<PassageSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPassageSets = async () => {
    try {
      setLoading(true);
      let response;
      
      if (textbookId) {
        // 특정 교재의 매핑된 지문세트들 조회
        response = await apiEndpoints.textbookMappings.list(textbookId);
        if (response.data.success) {
          setPassageSets(response.data.data.passageSets || []);
        }
      } else {
        // 모든 독립적인 지문세트들 조회
        response = await apiEndpoints.passageSets.list();
        if (response.data.success) {
          // 백엔드 응답 구조에 따라 조정
          const data = response.data.data;
          if (Array.isArray(data)) {
            setPassageSets(data);
          } else if (data && data.passageSets && Array.isArray(data.passageSets)) {
            setPassageSets(data.passageSets);
          } else {
            setPassageSets([]);
          }
        }
      }
      
      if (!response.data.success) {
        setError('지문세트 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('지문세트 목록을 불러오는데 실패했습니다.');
      console.error('Fetch passage sets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPassageSet = async (data: any) => {
    try {
      // 독립적인 지문세트 생성
      const response = await apiEndpoints.passageSets.create(data);
      if (response.data.success) {
        await fetchPassageSets();
        return response.data.data;
      } else {
        throw new Error('지문세트 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Create passage set error:', err);
      throw err;
    }
  };

  const updatePassageSet = async (id: string, data: any) => {
    try {
      const response = await apiEndpoints.passageSets.update(id, data);
      if (response.data.success) {
        await fetchPassageSets();
        return response.data.data;
      } else {
        throw new Error('지문세트 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Update passage set error:', err);
      throw err;
    }
  };

  const deletePassageSet = async (id: string) => {
    try {
      const response = await apiEndpoints.passageSets.delete(id);
      if (response.data.success) {
        await fetchPassageSets();
        return true;
      } else {
        throw new Error('지문세트 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete passage set error:', err);
      throw err;
    }
  };

  const regenerateQRCode = async (id: string) => {
    try {
      const response = await apiEndpoints.passageSets.regenerateQR(id);
      if (response.data.success) {
        await fetchPassageSets();
        return response.data.data;
      } else {
        throw new Error('QR 코드 재생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Regenerate QR code error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPassageSets();
  }, [textbookId]);

  return {
    passageSets,
    loading,
    error,
    fetchPassageSets,
    createPassageSet,
    updatePassageSet,
    deletePassageSet,
    regenerateQRCode,
  };
}