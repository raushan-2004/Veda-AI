import { z } from 'zod';

export const AIQuestionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
  marks: z.number().int().min(1).default(1),
  type: z.string().min(1, 'Question type format is required'),
});

export const AISectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  instruction: z.string().min(1, 'Section instruction is required'),
  questions: z.array(AIQuestionSchema).min(1, 'Each section must contain at least one question'),
});

export const AISchema = z.object({
  assignmentTitle: z.string().min(1, 'Assignment title is required'),
  sections: z.array(AISectionSchema).min(1, 'Assignment must contain at least one section'),
});

export type AIQuestion = z.infer<typeof AIQuestionSchema>;
export type AISection = z.infer<typeof AISectionSchema>;
export type AIOutput = z.infer<typeof AISchema>;
export default AISchema;
