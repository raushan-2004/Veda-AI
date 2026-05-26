import { z } from 'zod';

// ==================== Question Types ====================
export const QuestionTypeSchema = z.enum([
  'multiple-choice',
  'true-false',
  'short-answer',
  'essay',
  'fill-in-the-blank',
  'matching',
  'ordering',
  'code',
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// ==================== Difficulty ====================
export const DifficultySchema = z.enum(['easy', 'medium', 'hard', 'expert']);
export type Difficulty = z.infer<typeof DifficultySchema>;

// ==================== Question Schema ====================
export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean().optional(), // Hidden from students
});

export const QuestionSchema = z.object({
  _id: z.string(),
  type: QuestionTypeSchema,
  prompt: z.string().min(1),
  options: z.array(QuestionOptionSchema).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  explanation: z.string().optional(),
  points: z.number().min(0).default(1),
  difficulty: DifficultySchema.default('medium'),
  tags: z.array(z.string()).default([]),
  timeLimit: z.number().optional(), // In seconds
  mediaUrl: z.string().url().optional(),
  order: z.number().default(0),
});

export type Question = z.infer<typeof QuestionSchema>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

// ==================== Assessment Schema ====================
export const AssessmentStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
  'scheduled',
]);

export const AssessmentSettingsSchema = z.object({
  timeLimit: z.number().optional(),           // Total time in minutes
  maxAttempts: z.number().min(1).default(1),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).default(70),
  allowReview: z.boolean().default(true),
  proctored: z.boolean().default(false),
  scheduledAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const AssessmentSchema = z.object({
  _id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  coverImage: z.string().url().optional(),
  questions: z.array(QuestionSchema),
  settings: AssessmentSettingsSchema,
  status: AssessmentStatusSchema.default('draft'),
  createdBy: z.string(), // User ID
  totalPoints: z.number().default(0),
  estimatedDuration: z.number().optional(), // In minutes
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;
export type AssessmentSettings = z.infer<typeof AssessmentSettingsSchema>;
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

// ==================== Submission Schema ====================
export const AnswerSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
  timeTaken: z.number().optional(), // In seconds
});

export const SubmissionSchema = z.object({
  _id: z.string(),
  assessmentId: z.string(),
  userId: z.string(),
  answers: z.array(AnswerSchema),
  score: z.number().optional(),
  percentage: z.number().optional(),
  passed: z.boolean().optional(),
  startedAt: z.string().datetime(),
  submittedAt: z.string().datetime().optional(),
  timeSpent: z.number().optional(), // In seconds
  status: z.enum(['in-progress', 'submitted', 'graded', 'timed-out']),
});

export type Submission = z.infer<typeof SubmissionSchema>;
export type Answer = z.infer<typeof AnswerSchema>;

// ==================== AI Generation Schema ====================
export const AIGenerateSchema = z.object({
  topic: z.string().min(1),
  subject: z.string().optional(),
  numberOfQuestions: z.number().min(1).max(50).default(10),
  difficulty: DifficultySchema.optional(),
  questionTypes: z.array(QuestionTypeSchema).optional(),
  additionalContext: z.string().optional(),
  language: z.string().default('en'),
});

export type AIGenerateInput = z.infer<typeof AIGenerateSchema>;
