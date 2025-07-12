import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  setId: mongoose.Types.ObjectId;
  questionNumber: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    setId: {
      type: Schema.Types.ObjectId,
      ref: 'PassageSet',
      required: [true, 'Set ID is required']
    },
    questionNumber: {
      type: Number,
      required: [true, 'Question number is required'],
      min: [1, 'Question number must be positive']
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxLength: [1000, 'Question text cannot exceed 1000 characters']
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function(options: string[]) {
          return options.length >= 2 && options.length <= 5;
        },
        message: 'Options must have between 2 and 5 choices'
      }
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
      validate: {
        validator: function(this: IQuestion, answer: string) {
          return this.options.includes(answer);
        },
        message: 'Correct answer must be one of the options'
      }
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
      maxLength: [2000, 'Explanation cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
questionSchema.index({ setId: 1, questionNumber: 1 }, { unique: true });
questionSchema.index({ questionText: 'text', explanation: 'text' }); // Text search

export default mongoose.model<IQuestion>('Question', questionSchema);