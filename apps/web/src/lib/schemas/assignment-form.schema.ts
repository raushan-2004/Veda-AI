import { z } from 'zod';

export const AssignmentFormSchema = z.object({
  title: z.string().min(1, 'Assignment title is required').max(200, 'Title cannot exceed 200 characters'),
  subject: z.string().min(1, 'Subject is required'),
  classGrade: z.string().min(1, 'Class/Grade is required'),
  dueDate: z.string().min(1, 'Due date is required').refine((val) => {
    if (!val) return false;
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, { message: 'Due date must be today or in the future' }),
  questionTypes: z.array(z.string()).min(1, 'Select at least one question type'),
  numberOfQuestions: z.number().min(5, 'Minimum 5 questions required').max(50, 'Maximum 50 questions allowed'),
  marks: z.number().min(1, 'Minimum 1 mark required').max(100, 'Maximum 100 marks allowed'),
  difficultyDistribution: z.object({
    beginner: z.number().min(0).max(100),
    intermediate: z.number().min(0).max(100),
    expert: z.number().min(0).max(100),
  }).refine((data) => {
    return (data.beginner + data.intermediate + data.expert) === 100;
  }, { message: 'Percentages must sum to exactly 100%', path: ['beginner'] }),
  file: z.any().optional().refine((fileList) => {
    if (!fileList || !(fileList instanceof FileList) || fileList.length === 0) return true;
    const file = fileList[0];
    const allowedExtensions = ['.pdf', '.txt', '.md', '.docx'];
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  }, { message: 'Allowed formats: PDF, TXT, MD, DOCX' }).refine((fileList) => {
    if (!fileList || !(fileList instanceof FileList) || fileList.length === 0) return true;
    const file = fileList[0];
    return file.size <= 5 * 1024 * 1024; // 5MB limit
  }, { message: 'File size must be under 5MB' }),
  additionalInstructions: z.string().optional(),
});

export type AssignmentFormData = z.infer<typeof AssignmentFormSchema>;
