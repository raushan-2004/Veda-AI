import mongoose, { Schema } from 'mongoose';
import type { QuestionType, Difficulty } from '@veda-ai/types';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  _id: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  points: number;
  difficulty: Difficulty;
  tags: string[];
  timeLimit?: number;
  mediaUrl?: string;
  order: number;
}

export interface GeneratedPaperDocument extends mongoose.Document {
  assignmentId: mongoose.Types.ObjectId;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<QuestionOption>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean },
}, { _id: false });

const QuestionSchema = new Schema<Question>({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [QuestionOptionSchema],
  correctAnswer: { type: Schema.Types.Mixed },
  explanation: { type: String },
  points: { type: Number, default: 1 },
  difficulty: { type: String, default: 'medium' },
  tags: [{ type: String }],
  timeLimit: { type: Number },
  mediaUrl: { type: String },
  order: { type: Number, default: 0 },
}, { _id: false });

const GeneratedPaperSchema = new Schema<GeneratedPaperDocument>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, unique: true, index: true },
  questions: [QuestionSchema],
}, {
  timestamps: true,
});

export const GeneratedPaperModel = mongoose.models.GeneratedPaper || mongoose.model<GeneratedPaperDocument>('GeneratedPaper', GeneratedPaperSchema);
export default GeneratedPaperModel;
