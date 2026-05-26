import mongoose, { Schema } from 'mongoose';
import type { AssessmentStatus } from '@veda-ai/types';

export interface AssignmentDifficulty {
  beginner: number;
  intermediate: number;
  expert: number;
}

export interface AssignmentDocument extends mongoose.Document {
  title: string;
  subject: string;
  classGrade: string;
  dueDate: Date;
  numQuestions: number;
  marks: number;
  difficulty: AssignmentDifficulty;
  formats: string[];
  instructions?: string;
  status: AssessmentStatus;
  createdBy: mongoose.Types.ObjectId;
  referenceFiles: mongoose.Types.ObjectId[];
  generatedPaper?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DifficultySchema = new Schema<AssignmentDifficulty>({
  beginner: { type: Number, required: true, min: 0, max: 100 },
  intermediate: { type: Number, required: true, min: 0, max: 100 },
  expert: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const AssignmentSchema = new Schema<AssignmentDocument>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subject: { type: String, required: true, trim: true },
  classGrade: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  numQuestions: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
  difficulty: { type: DifficultySchema, required: true },
  formats: [{ type: String, required: true }],
  instructions: { type: String },
  status: { type: String, enum: ['draft', 'published', 'archived', 'scheduled'], default: 'draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referenceFiles: [{ type: Schema.Types.ObjectId, ref: 'UploadFile' }],
  generatedPaper: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper' },
}, {
  timestamps: true,
});

// Compound index on educator and creation date for visual list queries
AssignmentSchema.index({ createdBy: 1, createdAt: -1 });

export const AssignmentModel = mongoose.models.Assignment || mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema);
export default AssignmentModel;
