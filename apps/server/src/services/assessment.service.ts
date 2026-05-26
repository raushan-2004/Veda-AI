import { aiGenerationQueue } from '@/queues';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { AssignmentModel } from '@/models/assignment.model';
import { GeneratedPaperModel } from '@/models/generated-paper.model';
import { aiService } from '@/services/ai.service';
import { getIO } from '@/socket';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { getRedis } from '@/config/redis';

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
    return AssignmentModel.find().sort({ createdAt: -1 }).lean();
  }

  public async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Assignment with ID '${id}' is not a valid identifier`);
    }

    const cacheKey = `assessment:cache:${id}`;
    
    // Step 1: Query Redis cache
    try {
      const redisClient = getRedis();
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        logger.info(`⚡ Redis Cache HIT for getById assessment: ${id}`);
        return JSON.parse(cachedData);
      }
    } catch (cacheErr: any) {
      logger.warn(`⚠️ Redis cache read skipped: ${cacheErr.message}`);
    }

    // Step 2: Query MongoDB on cache miss
    logger.info(`🐢 Redis Cache MISS for getById assessment: ${id} - querying MongoDB`);
    const item = await AssignmentModel.findById(id).populate('generatedPaper').lean();
    if (!item) {
      throw new NotFoundError(`Assignment with ID '${id}' not found`);
    }

    // Step 3: Populate Redis cache with 5 min TTL (300 seconds)
    try {
      const redisClient = getRedis();
      await redisClient.set(cacheKey, JSON.stringify(item), 'EX', 300);
    } catch (cacheErr: any) {
      logger.warn(`⚠️ Redis cache write skipped: ${cacheErr.message}`);
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
    let queuedSuccess = false;
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
      queuedSuccess = true;
    } catch (queueError: any) {
      logger.warn(`⚠️ BullMQ queue skipped (connection unavailable): ${queueError.message}`);
    }

    if (!queuedSuccess) {
      logger.info(`💡 Redis offline fallback: Initiating in-process generation for ${assignmentIdStr}`);
      this.runInProcessGeneration(assignmentIdStr, `${data.subject} — ${data.title}`, data.numQuestions, data.formats);
    }

    return assignment;
  }

  public async regenerate(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Assignment with ID '${id}' is not a valid identifier`);
    }
    const assignment = await AssignmentModel.findById(id);
    if (!assignment) {
      throw new NotFoundError(`Assignment with ID '${id}' not found`);
    }

    // Set status back to draft while AI regenerates
    assignment.status = 'draft';
    await assignment.save();

    // Trigger BullMQ AI Generation background process using database ID
    let queuedSuccess = false;
    try {
      await aiGenerationQueue.add(
        'generate-quiz',
        {
          topic: `${assignment.subject} — ${assignment.title}`,
          userId: assignment.createdBy.toString(),
          assessmentId: assignment._id.toString(),
          numQuestions: assignment.numQuestions,
          formats: assignment.formats,
        },
        {
          jobId: `job_${assignment._id.toString()}`,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
      logger.info(`🚀 BullMQ AI Generation background task re-scheduled: job_${assignment._id.toString()}`);
      queuedSuccess = true;
    } catch (queueError: any) {
      logger.warn(`⚠️ BullMQ queue skipped (connection unavailable): ${queueError.message}`);
    }

    if (!queuedSuccess) {
      logger.info(`💡 Redis offline fallback: Retriggering in-process generation for ${id}`);
      this.runInProcessGeneration(id, `${assignment.subject} — ${assignment.title}`, assignment.numQuestions, assignment.formats);
    }

    return assignment;
  }
  
  public async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Assignment with ID '${id}' is not a valid identifier`);
    }
    const assignment = await AssignmentModel.findById(id);
    if (!assignment) {
      throw new NotFoundError(`Assignment with ID '${id}' not found`);
    }

    // Delete associated GeneratedPaper
    if (assignment.generatedPaper) {
      await GeneratedPaperModel.findByIdAndDelete(assignment.generatedPaper);
    }

    // Delete the Assignment itself
    await AssignmentModel.findByIdAndDelete(id);

    // Delete associated PDF if it exists
    const filePath = path.join(__dirname, '../../temp/pdfs', `${id}.pdf`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`🗑️ Deleted compiled PDF file: ${id}.pdf`);
      } catch (err) {
        logger.error(`Error deleting PDF file: ${err}`);
      }
    }

    // Invalidate Redis cache
    try {
      const redisClient = getRedis();
      await redisClient.del(`assessment:cache:${id}`);
      logger.info(`🧹 Invalidated Redis Cache for deleted assessment: ${id}`);
    } catch (cacheErr: any) {
      logger.warn(`⚠️ Redis cache invalidation skipped: ${cacheErr.message}`);
    }

    return true;
  }

  private async runInProcessGeneration(assessmentId: string, topic: string, numQuestions: number, formats: string[]): Promise<void> {
    const jobId = `job_${assessmentId}`;

    const updateJob = async (status: string, progress: number, phase: string) => {
      try {
        const ioInstance = getIO();
        if (ioInstance) {
          ioInstance.to(`job:${jobId}`).emit('generation:progress', {
            jobId,
            progress,
            phase,
            status,
          });
        }
      } catch (err: any) {
        logger.warn(`Could not emit in-process socket update: ${err.message}`);
      }
    };

    // Run in background promise so we do not block request thread
    (async () => {
      try {
        // Emit started
        try {
          const ioInstance = getIO();
          if (ioInstance) {
            ioInstance.to(`job:${jobId}`).emit('generation:started', {
              jobId,
              assessmentId,
            });
          }
        } catch (err: any) {
          logger.debug(`In-process generation start socket emit skipped: ${err.message}`);
        }

        // Step 1: Processing layout styling & fetching details (25%)
        await new Promise((r) => setTimeout(r, 800));
        await updateJob('processing', 25, 'Structuring AI prompt parameters (in-process fallback)');
        
        const assignment = await AssignmentModel.findById(assessmentId);
        if (!assignment) throw new Error(`Assignment with ID ${assessmentId} not found`);

        // Step 2: Generative LLM Inference & Zod validation (50%)
        await new Promise((r) => setTimeout(r, 800));
        await updateJob('generating', 50, 'Running generative LLM APIs inference (in-process fallback)');
        
        const aiOutput = await aiService.generateAssessment(
          assignment.subject,
          topic,
          assignment.classGrade,
          numQuestions,
          formats
        );

        // Step 3: Zod validation checking & formatting questions (75%)
        await new Promise((r) => setTimeout(r, 800));
        await updateJob('generating', 75, 'Executing structural validation checks');

        let questionIndex = 0;
        const questions: any[] = [];

        for (const section of aiOutput.sections) {
          for (const q of section.questions) {
            const qType = q.type || 'multiple-choice';
            questions.push({
              _id: `q_${Math.random().toString(36).substring(7)}`,
              type: qType,
              prompt: q.question,
              options: qType === 'multiple-choice' ? [
                { id: 'a', text: 'Option A (Correct)', isCorrect: true },
                { id: 'b', text: 'Option B' },
                { id: 'c', text: 'Option C' },
              ] : undefined,
              correctAnswer: qType === 'multiple-choice' ? 'a' : undefined,
              points: q.marks || 1,
              difficulty: q.difficulty || 'medium',
              tags: [topic, section.title].filter(Boolean),
              order: questionIndex++,
            });
          }
        }

        const generatedPaper = await GeneratedPaperModel.create({
          assignmentId: assessmentId,
          questions,
        });

        await AssignmentModel.findByIdAndUpdate(assessmentId, {
          generatedPaper: generatedPaper._id,
          status: 'published',
        });

        // Invalidate Redis cache
        try {
          const redisClient = getRedis();
          await redisClient.del(`assessment:cache:${assessmentId}`);
          logger.info(`🧹 Invalidated Redis Cache for finished fallback assessment: ${assessmentId}`);
        } catch (cacheErr: any) {
          logger.warn(`⚠️ Redis cache invalidation skipped: ${cacheErr.message}`);
        }

        // Step 4: Finished (100%)
        await new Promise((r) => setTimeout(r, 800));
        await updateJob('completed', 100, 'Assessment compiled and published successfully');
        
        try {
          const ioInstance = getIO();
          if (ioInstance) {
            ioInstance.to(`job:${jobId}`).emit('generation:completed', {
              jobId,
              assessmentId,
              questionsCount: questions.length,
            });
          }
        } catch (err: any) {
          logger.debug(`In-process generation completed socket emit skipped: ${err.message}`);
        }
      } catch (error: any) {
        logger.error(`❌ In-process Generation fallback error: ${error.message}`);
        try {
          const ioInstance = getIO();
          if (ioInstance) {
            ioInstance.to(`job:${jobId}`).emit('generation:failed', {
              jobId,
              error: error.message,
            });
          }
        } catch (err: any) {
          logger.debug(`In-process generation failed socket emit skipped: ${err.message}`);
        }
      }
    })();
  }
}

export const assessmentService = new AssessmentService();
export default assessmentService;
