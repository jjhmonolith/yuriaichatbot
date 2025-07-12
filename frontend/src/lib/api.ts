import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth header if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Health check
  health: () => api.get('/health'),
  
  // Admin endpoints
  textbooks: {
    list: () => api.get('/admin/textbooks'),
    create: (data: any) => api.post('/admin/textbooks', data),
    get: (id: string) => api.get(`/admin/textbooks/${id}`),
    update: (id: string, data: any) => api.put(`/admin/textbooks/${id}`, data),
    delete: (id: string) => api.delete(`/admin/textbooks/${id}`),
  },
  
  passageSets: {
    // NEW: 독립적인 지문세트 관리
    list: () => api.get('/admin/passage-sets'),
    create: (data: any) => api.post('/admin/passage-sets', data),
    get: (id: string) => api.get(`/admin/passage-sets/${id}`),
    update: (id: string, data: any) => api.put(`/admin/passage-sets/${id}`, data),
    delete: (id: string) => api.delete(`/admin/passage-sets/${id}`),
    regenerateQR: (id: string) => api.post(`/admin/passage-sets/${id}/regenerate-qr`),
    getQRImage: (id: string) => api.get(`/admin/passage-sets/${id}/qr-image`),
    
    // LEGACY: 하위 호환성
    listByTextbook: (textbookId: string) => api.get(`/admin/textbooks/${textbookId}/sets`),
    createInTextbook: (textbookId: string, data: any) => api.post(`/admin/textbooks/${textbookId}/sets`, data),
    listAll: () => api.get('/admin/sets'),
  },
  
  // NEW: 교재-지문세트 매핑 관리
  textbookMappings: {
    list: (textbookId: string) => api.get(`/admin/textbooks/${textbookId}/mappings`),
    add: (textbookId: string, passageSetId: string) => api.post(`/admin/textbooks/${textbookId}/mappings/${passageSetId}`),
    remove: (textbookId: string, passageSetId: string) => api.delete(`/admin/textbooks/${textbookId}/mappings/${passageSetId}`),
    reorder: (textbookId: string, data: any) => api.put(`/admin/textbooks/${textbookId}/mappings/reorder`, data),
  },
  
  questions: {
    list: (setId: string) => api.get(`/admin/sets/${setId}/questions`),
    listAll: () => api.get('/admin/questions'),
    create: (setId: string, data: any) => api.post(`/admin/sets/${setId}/questions`, data),
    get: (id: string) => api.get(`/admin/questions/${id}`),
    update: (id: string, data: any) => api.put(`/admin/questions/${id}`, data),
    delete: (id: string) => api.delete(`/admin/questions/${id}`),
  },
  
  // Chat endpoints (will be implemented later)
  chat: {
    getSet: (qrCode: string) => api.get(`/chat/${qrCode}`),
    sendMessage: (qrCode: string, data: any) => api.post(`/chat/${qrCode}/message`, data),
  }
};

export default api;