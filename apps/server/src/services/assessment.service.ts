import { aiGenerationQueue } from '@/queues';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { AssignmentModel } from '@/models/assignment.model';
import mongoose from 'mongoose';

export interface AssessmentCreationData {
  title: string;
  subject: string;
  classGrade: string;
  dueDate: string;
  numQuestions: number;
  marks: number;
  difficulty: {
    beginner: number;
    intermediate: number;
    expert: number;
  };
  formats: string[];
  instructions?: string;
}

export class AssessmentService {
  public async getAll() {
    return AssignmentModel.find().sort({ createdAt: -1 });
  }

  public async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Assignment with ID '${id}' is not a valid identifier`);
    }
    const item = await AssignmentModel.findById(id);
    if (!item) {
      throw new NotFoundError(`Assignment with ID '${id}' not found`);
    }
    return item;
  }

  public async create(data: AssessmentCreationData, userId: string) {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId();

    // Create real persistent Assignment in MongoDB
    const assignment = await AssignmentModel.create({
      title: data.title,
      subject: data.subject,
      classGrade: data.classGrade,
      dueDate: new Date(data.dueDate),
      numQuestions: data.numQuestions,
      marks: data.marks,
      difficulty: {
        beginner: data.difficulty.beginner,
        intermediate: data.difficulty.intermediate,
        expert: data.difficulty.expert,
      },
      formats: data.formats,
      instructions: data.instructions,
      status: 'draft',
      createdBy: userObjectId,
    });

    const assignmentIdStr = assignment._id.toString();

    // Trigger BullMQ AI Generation background process using real database ID
    try {
      await aiGenerationQueue.add(
        'generate-quiz',
        {
          topic: `${data.subject} — ${data.title}`,
          userId,
          assessmentId: assignmentIdStr,
          numQuestions: data.numQuestions,
          formats: data.formats,
        },
        {
          jobId: `job_${assignmentIdStr}`,
        }
      );
      logger.info(`🚀 BullMQ AI Generation background task queued: job_${assignmentIdStr}`);
    } catch (queueError: any) {
      logger.warn(`⚠️ BullMQ queue skipped (connection unavailable): ${queueError.message}`);
    }

    return assignment;
  }
}

export const assessmentService = new AssessmentService();
export default assessmentService;
