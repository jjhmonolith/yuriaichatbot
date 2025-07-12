import mongoose from 'mongoose';

export interface ISystemPromptVersion {
  _id: string;
  promptKey: string; // 어떤 프롬프트의 버전인지 식별
  content: string; // 해당 버전의 프롬프트 내용
  version: number; // 버전 번호
  description?: string; // 버전에 대한 설명 (선택사항)
  createdBy?: string; // 누가 만들었는지 (추후 사용자 관리 시)
  createdAt: Date;
}

const systemPromptVersionSchema = new mongoose.Schema<ISystemPromptVersion>({
  promptKey: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    trim: true,
    default: 'admin'
  }
}, {
  timestamps: true
});

// 인덱스 설정
systemPromptVersionSchema.index({ promptKey: 1, version: -1 }); // 최신 버전순 정렬
systemPromptVersionSchema.index({ promptKey: 1, createdAt: -1 }); // 생성일순 정렬

// promptKey + version 조합은 유니크해야 함
systemPromptVersionSchema.index({ promptKey: 1, version: 1 }, { unique: true });

export const SystemPromptVersion = mongoose.model<ISystemPromptVersion>('SystemPromptVersion', systemPromptVersionSchema);