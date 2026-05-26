import { z } from 'zod';

export const CreateAssessmentSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Assessment title must be at least 3 characters'),
    subject: z.string().min(1, 'Subject is required'),
    classGrade: z.string().min(1, 'Class/Grade is required'),
    dueDate: z.string().datetime('Due date must be a valid ISO datetime string'),
    numQuestions: z.number().int().min(1, 'Number of questions must be at least 1').max(100),
    marks: z.number().int().min(1, 'Total marks must be at least 1'),
    difficulty: z.object({
      beginner: z.number().min(0).max(100),
      intermediate: z.number().min(0).max(100),
      expert: z.number().min(0).max(100),
    }).refine((data) => {
      return (data.beginner + data.intermediate + data.expert) === 100;
    }, {
      message: 'Proportional difficulty allocation weights must sum to exactly 100%',
      path: ['difficulty'],
    }),
    formats: z.array(z.string()).min(1, 'At least one question type format must be selected'),
    instructions: z.string().optional(),
  }),
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
