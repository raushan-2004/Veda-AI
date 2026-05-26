import { aiGenerationQueue } from '@/queues';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';

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
  private mockAssessments = [
    {
      _id: "react-fundamentals",
      title: "React Fundamentals",
      description: "Covers hooks, virtual DOM, and component lifecycles.",
      questions: 10,
      difficulty: "intermediate",
      created: "2026-05-24",
      averageScore: "88%",
      submissions: 24,
    },
    {
      _id: "express-api-engineering",
      title: "Express API Engineering",
      description: "Middleware routing, rate limiters, and error handlers.",
      questions: 15,
      difficulty: "expert",
      created: "2026-05-22",
      averageScore: "74%",
      submissions: 18,
    },
  ];

  public async getAll() {
    return this.mockAssessments;
  }

  public async getById(id: string) {
    const item = this.mockAssessments.find((a) => a._id === id);
    if (!item) {
      throw new NotFoundError(`Assessment catalog log with ID '${id}' not found`);
    }
    return item;
  }

  public async create(data: AssessmentCreationData, userId: string) {
    const mockId = `assessment_${Math.random().toString(36).substring(7)}`;
    const newAssessment = {
      _id: mockId,
      title: data.title,
      description: data.instructions || `AI Generated assessment on ${data.subject}`,
      questions: data.numQuestions,
      difficulty: data.difficulty.expert > 50 ? 'expert' : data.difficulty.intermediate > 50 ? 'intermediate' : 'beginner',
      created: new Date().toISOString().split('T')[0],
      averageScore: '0%',
      submissions: 0,
    };

    // Add mock assessment to memory cache
    this.mockAssessments.unshift(newAssessment);

    // Trigger BullMQ AI Generation background process
    try {
      await aiGenerationQueue.add(
        'generate-quiz',
        {
          topic: `${data.subject} — ${data.title}`,
          userId,
          assessmentId: mockId,
          numQuestions: data.numQuestions,
          formats: data.formats,
        },
        {
          jobId: `job_${mockId}`,
        }
      );
      logger.info(`🚀 BullMQ AI Generation background task queued: job_${mockId}`);
    } catch (queueError: any) {
      logger.warn(`⚠️ BullMQ queue skipped (connection unavailable): ${queueError.message}`);
    }

    return newAssessment;
  }
}

export const assessmentService = new AssessmentService();
export default assessmentService;
