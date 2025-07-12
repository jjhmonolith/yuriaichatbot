import mongoose, { Schema, Document } from 'mongoose';

export interface ITextbookPassageMapping extends Document {
  textbookId: mongoose.Types.ObjectId;
  passageSetId: mongoose.Types.ObjectId;
  order: number; // 교재 내에서의 지문 순서
  qrCode: string; // 교재-지문 매핑별 고유 QR 코드
  qrCodeUrl: string; // QR 코드 URL
  createdAt: Date;
  updatedAt: Date;
}

const TextbookPassageMappingSchema = new Schema<ITextbookPassageMapping>({
  textbookId: {
    type: Schema.Types.ObjectId,
    ref: 'Textbook',
    required: true,
    index: true
  },
  passageSetId: {
    type: Schema.Types.ObjectId,
    ref: 'PassageSet',
    required: true,
    index: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  qrCodeUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'textbook_passage_mappings'
});

// 복합 인덱스: 같은 교재에서 같은 지문세트 중복 방지
TextbookPassageMappingSchema.index({ textbookId: 1, passageSetId: 1 }, { unique: true });

// 교재별 순서 관리를 위한 인덱스
TextbookPassageMappingSchema.index({ textbookId: 1, order: 1 }, { unique: true });

export const TextbookPassageMapping = mongoose.model<ITextbookPassageMapping>('TextbookPassageMapping', TextbookPassageMappingSchema);