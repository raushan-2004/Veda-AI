import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GenerationState {
  activeJobId: string | null;
  generationProgress: number;
  currentStatus: string;
  hasFailed: boolean;
  errorLogs: string | null;

  // Actions
  startGenerationJob: (jobId: string) => void;
  updateProgress: (progress: number, status: string) => void;
  failGenerationJob: (error: string) => void;
  completeGenerationJob: () => void;
  resetGenerationStore: () => void;
}

export const useGenerationStore = create<GenerationState>()(
  devtools(
    (set) => ({
      activeJobId: null,
      generationProgress: 0,
      currentStatus: '',
      hasFailed: false,
      errorLogs: null,

      startGenerationJob: (activeJobId) =>
        set(
          {
            activeJobId,
            generationProgress: 0,
            currentStatus: 'Job queued inside AI compiler...',
            hasFailed: false,
            errorLogs: null,
          },
          false,
          'generation/startGenerationJob'
        ),

      updateProgress: (generationProgress, currentStatus) =>
        set(
          { generationProgress, currentStatus },
          false,
          'generation/updateProgress'
        ),

      failGenerationJob: (errorLogs) =>
        set(
          { hasFailed: true, errorLogs, currentStatus: 'AI Generation Failed' },
          false,
          'generation/failGenerationJob'
        ),

      completeGenerationJob: () =>
        set(
          {
            generationProgress: 100,
            currentStatus: 'AI Generation Successful!',
            activeJobId: null,
          },
          false,
          'generation/completeGenerationJob'
        ),

      resetGenerationStore: () =>
        set(
          {
            activeJobId: null,
            generationProgress: 0,
            currentStatus: '',
            hasFailed: false,
            errorLogs: null,
          },
          false,
          'generation/resetGenerationStore'
        ),
    }),
    { name: 'GenerationStore' }
  )
);
