import mongoose, { Schema } from 'mongoose';

export type JobStatusType = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobStatusDocument extends mongoose.Document {
  jobId: string;
  status: JobStatusType;
  progress: number;
  phase?: string;
  error?: string;
  userId: mongoose.Types.ObjectId;
  metadata?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const JobStatusSchema = new Schema<JobStatusDocument>({
  jobId: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued', required: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  phase: { type: String },
  error: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
});

export const JobStatusModel = mongoose.models.JobStatus || mongoose.model<JobStatusDocument>('JobStatus', JobStatusSchema);
export default JobStatusModel;
