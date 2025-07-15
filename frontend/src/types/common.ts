// Common types for the application

export interface Textbook {
  _id: string;
  title: string;
  subject: string;
  level: string;
  year: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PassageSet {
  _id: string;
  title: string;
  passage: string;
  passageComment: string;
  qrCode: string;
  qrCodeUrl: string;
  createdAt: string;
  updatedAt: string;
  // 매핑 정보 (교재별로 다를 수 있음)
  order?: number;
  mappingId?: string;
  mappingQrCode?: string; // 교재-지문 매핑별 QR 코드
  mappingQrCodeUrl?: string; // 교재-지문 매핑별 QR URL
  textbooks?: TextbookInfo[]; // 이 지문세트를 사용하는 교재들
}

export interface TextbookInfo {
  _id: string;
  title: string;
  subject: string;
  level: string;
  order?: number;
  mappingId?: string;
}

export interface TextbookPassageMapping {
  _id: string;
  textbookId: string;
  passageSetId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  setId: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  explanationStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  explanationGeneratedAt?: string;
  explanationError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  qrCode: string;
  title: string;
  messages: ChatMessage[];
  lastActivity: number;
}

export interface SystemPrompt {
  _id: string;
  key: string;
  name: string;
  description: string;
  content: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}