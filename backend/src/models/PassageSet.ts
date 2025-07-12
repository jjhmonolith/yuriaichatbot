import mongoose, { Document, Schema } from 'mongoose';

export interface IPassageSet extends Document {
  title: string;
  passage: string;
  passageComment: string;
  qrCode: string;
  qrCodeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const passageSetSchema = new Schema<IPassageSet>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters']
    },
    passage: {
      type: String,
      required: [true, 'Passage content is required'],
      trim: true,
      maxLength: [10000, 'Passage cannot exceed 10000 characters']
    },
    passageComment: {
      type: String,
      required: [true, 'Passage comment is required'],
      trim: true,
      maxLength: [2000, 'Passage comment cannot exceed 2000 characters']
    },
    qrCode: {
      type: String,
      required: [true, 'QR code is required'],
      unique: true,
      trim: true
    },
    qrCodeUrl: {
      type: String,
      required: [true, 'QR code URL is required'],
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
passageSetSchema.index({ qrCode: 1 }, { unique: true });
passageSetSchema.index({ title: 'text', passage: 'text' }); // Text search

export default mongoose.model<IPassageSet>('PassageSet', passageSetSchema);