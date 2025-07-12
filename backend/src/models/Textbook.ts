import mongoose, { Document, Schema } from 'mongoose';

export interface ITextbook extends Document {
  title: string;
  subject: string;
  level: string;
  year: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const textbookSchema = new Schema<ITextbook>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxLength: [100, 'Title cannot exceed 100 characters']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxLength: [50, 'Subject cannot exceed 50 characters']
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['초등', '중등', '고등'],
      default: '고등'
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be after 2000'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'Description cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
textbookSchema.index({ title: 1, year: 1 });
textbookSchema.index({ subject: 1, level: 1 });

export default mongoose.model<ITextbook>('Textbook', textbookSchema);