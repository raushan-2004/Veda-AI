import mongoose, { Schema } from 'mongoose';

export interface UploadFileDocument extends mongoose.Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UploadFileSchema = new Schema<UploadFileDocument>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, {
  timestamps: true,
});

export const UploadFileModel = mongoose.models.UploadFile || mongoose.model<UploadFileDocument>('UploadFile', UploadFileSchema);
export default UploadFileModel;
