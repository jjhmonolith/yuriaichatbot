import mongoose from 'mongoose';

export interface ISystemPrompt {
  _id: string;
  key: string; // 프롬프트 식별자 (예: 'chat_assistant', 'passage_commentary', 'question_explanation')
  name: string; // 프롬프트 표시명
  description: string; // 프롬프트 설명
  content: string; // 실제 프롬프트 내용
  isActive: boolean; // 활성화 여부
  version: number; // 버전 관리
  createdAt: Date;
  updatedAt: Date;
}

const systemPromptSchema = new mongoose.Schema<ISystemPrompt>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// 인덱스 설정
systemPromptSchema.index({ key: 1 });
systemPromptSchema.index({ isActive: 1 });

export const SystemPrompt = mongoose.model<ISystemPrompt>('SystemPrompt', systemPromptSchema);