import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Assessment } from '@veda-ai/types';

// Initial assessments matching strict Assessment contract
const initialAssessments = [
  {
    _id: "react-fundamentals",
    title: "React Fundamentals",
    description: "Covers hooks, virtual DOM, and component lifecycles.",
    questions: Array(10).fill({
      _id: "q",
      type: "multiple-choice",
      prompt: "Mock Question",
      points: 1,
      difficulty: "medium",
      tags: [],
      order: 0,
    }),
    settings: {
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      allowReview: true,
      proctored: false,
    },
    status: "published",
    createdBy: "admin",
    totalPoints: 10,
    tags: ["intermediate"],
    createdAt: new Date("2026-05-24").toISOString(),
    updatedAt: new Date("2026-05-24").toISOString(),
    averageScore: "88%",
    submissions: 24,
  },
  {
    _id: "express-api-engineering",
    title: "Express API Engineering",
    description: "Middleware routing, rate limiters, and error handlers.",
    questions: Array(15).fill({
      _id: "q",
      type: "multiple-choice",
      prompt: "Mock Question",
      points: 1,
      difficulty: "hard",
      tags: [],
      order: 0,
    }),
    settings: {
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      allowReview: true,
      proctored: false,
    },
    status: "published",
    createdBy: "admin",
    totalPoints: 15,
    tags: ["expert"],
    createdAt: new Date("2026-05-22").toISOString(),
    updatedAt: new Date("2026-05-22").toISOString(),
    averageScore: "74%",
    submissions: 18,
  },
  {
    _id: "mongodb-schema-modeling",
    title: "MongoDB Schema Modeling",
    description: "Document structures, indexing strategies, and pipelines.",
    questions: Array(8).fill({
      _id: "q",
      type: "multiple-choice",
      prompt: "Mock Question",
      points: 1,
      difficulty: "easy",
      tags: [],
      order: 0,
    }),
    settings: {
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      allowReview: true,
      proctored: false,
    },
    status: "published",
    createdBy: "admin",
    totalPoints: 8,
    tags: ["beginner"],
    createdAt: new Date("2026-05-19").toISOString(),
    updatedAt: new Date("2026-05-19").toISOString(),
    averageScore: "91%",
    submissions: 32,
  },
  {
    _id: "typescript-generics",
    title: "TypeScript Generics & Types",
    description: "Mapped types, conditional types, and utility overrides.",
    questions: Array(12).fill({
      _id: "q",
      type: "multiple-choice",
      prompt: "Mock Question",
      points: 1,
      difficulty: "expert",
      tags: [],
      order: 0,
    }),
    settings: {
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      allowReview: true,
      proctored: false,
    },
    status: "published",
    createdBy: "admin",
    totalPoints: 12,
    tags: ["expert"],
    createdAt: new Date("2026-05-15").toISOString(),
    updatedAt: new Date("2026-05-15").toISOString(),
    averageScore: "81%",
    submissions: 15,
  },
  {
    _id: "css-grid-flexbox",
    title: "Modern CSS Grid & Flexbox",
    description: "Responsive alignment rulers and absolute grid layers.",
    questions: Array(10).fill({
      _id: "q",
      type: "multiple-choice",
      prompt: "Mock Question",
      points: 1,
      difficulty: "easy",
      tags: [],
      order: 0,
    }),
    settings: {
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      allowReview: true,
      proctored: false,
    },
    status: "published",
    createdBy: "admin",
    totalPoints: 10,
    tags: ["beginner"],
    createdAt: new Date("2026-05-10").toISOString(),
    updatedAt: new Date("2026-05-10").toISOString(),
    averageScore: "95%",
    submissions: 41,
  },
  {
    _id: "nextjs-server-actions",
    title: "Next.js Server Actions & SSR",
    description: "Data mutations, hydration states, and caching strategies.",
    questions: Array(14).fill({
      _id: "q",
      type: "multiple-choice",
      prompt: "Mock Question",
      points: 1,
      difficulty: "medium",
      tags: [],
      order: 0,
    }),
    settings: {
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      allowReview: true,
      proctored: false,
    },
    status: "published",
    createdBy: "admin",
    totalPoints: 14,
    tags: ["intermediate"],
    createdAt: new Date("2026-05-05").toISOString(),
    updatedAt: new Date("2026-05-05").toISOString(),
    averageScore: "83%",
    submissions: 20,
  }
] as unknown as Assessment[];

type AssessmentView = 'grid' | 'list';
type AssessmentFilter = 'all' | 'draft' | 'published' | 'archived';

interface AssessmentState {
  assessments: Assessment[];
  selectedAssessment: Assessment | null;
  isLoading: boolean;
  view: AssessmentView;
  filter: AssessmentFilter;
  searchQuery: string;
  rollbackAssessments: Assessment[] | null; // For holding rolling states

  // Actions
  setAssessments: (assessments: Assessment[]) => void;
  setSelectedAssessment: (assessment: Assessment | null) => void;
  setLoading: (loading: boolean) => void;
  setView: (view: AssessmentView) => void;
  setFilter: (filter: AssessmentFilter) => void;
  setSearchQuery: (query: string) => void;

  // --- OPTIMISTIC UI ASYNC ACTIONS ---
  addAssessmentAsync: (assessment: Assessment) => Promise<void>;
  updateAssessmentAsync: (id: string, partial: Partial<Assessment>) => Promise<void>;
  removeAssessmentAsync: (id: string) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    (set, get) => ({
      assessments: initialAssessments,
      selectedAssessment: null,
      isLoading: false,
      view: 'grid',
      filter: 'all',
      searchQuery: '',
      rollbackAssessments: null,

      setAssessments: (assessments) =>
        set({ assessments }, false, 'assessment/setAssessments'),

      setSelectedAssessment: (assessment) =>
        set({ selectedAssessment: assessment }, false, 'assessment/setSelected'),

      setLoading: (isLoading) => set({ isLoading }, false, 'assessment/setLoading'),

      setView: (view) => set({ view }, false, 'assessment/setView'),

      setFilter: (filter) => set({ filter }, false, 'assessment/setFilter'),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }, false, 'assessment/setSearchQuery'),

      // Optimistic Add Action
      addAssessmentAsync: async (assessment) => {
        const previousAssessments = get().assessments;
        
        // Step 1: Update UI instantly (Optimistic)
        set(
          { 
            assessments: [assessment, ...previousAssessments],
            rollbackAssessments: previousAssessments
          }, 
          false, 
          'assessment/addOptimistic'
        );

        try {
          // Step 2: Simulate async server call (1 second)
          await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              // Simulating 5% chance of network error to verify rollbacks
              if (Math.random() < 0.05) {
                reject(new Error('Simulated network database write error'));
              } else {
                resolve();
              }
            }, 1000);
          });
          
          // Clear rollback array upon successful commit
          set({ rollbackAssessments: null }, false, 'assessment/addCommit');
        } catch (error) {
          // Step 3: Trigger rollback on failure
          set(
            { 
              assessments: previousAssessments,
              rollbackAssessments: null 
            }, 
            false, 
            'assessment/addRollback'
          );
          throw error;
        }
      },

      // Optimistic Update Action
      updateAssessmentAsync: async (id, partial) => {
        const previousAssessments = get().assessments;
        
        // Step 1: Update UI instantly (Optimistic)
        const updated = previousAssessments.map((a) =>
          a._id === id ? { ...a, ...partial } : a
        );
        
        set(
          { 
            assessments: updated,
            rollbackAssessments: previousAssessments
          }, 
          false, 
          'assessment/updateOptimistic'
        );

        try {
          // Step 2: Simulate async server call
          await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              if (Math.random() < 0.05) {
                reject(new Error('Simulated database update conflict'));
              } else {
                resolve();
              }
            }, 1000);
          });
          
          set({ rollbackAssessments: null }, false, 'assessment/updateCommit');
        } catch (error) {
          // Step 3: Rollback on failure
          set(
            { 
              assessments: previousAssessments,
              rollbackAssessments: null 
            }, 
            false, 
            'assessment/updateRollback'
          );
          throw error;
        }
      },

      // Optimistic Delete Action
      removeAssessmentAsync: async (id) => {
        const previousAssessments = get().assessments;
        
        // Step 1: Update UI instantly (Optimistic)
        set(
          { 
            assessments: previousAssessments.filter((a) => a._id !== id),
            rollbackAssessments: previousAssessments
          }, 
          false, 
          'assessment/removeOptimistic'
        );

        try {
          // Step 2: Simulate async server deletion
          await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              if (Math.random() < 0.05) {
                reject(new Error('Failed to delete catalog entry from server'));
              } else {
                resolve();
              }
            }, 1000);
          });
          
          set({ rollbackAssessments: null }, false, 'assessment/removeCommit');
        } catch (error) {
          // Step 3: Rollback on failure
          set(
            { 
              assessments: previousAssessments,
              rollbackAssessments: null 
            }, 
            false, 
            'assessment/removeRollback'
          );
          throw error;
        }
      },
    }),
    { name: 'AssessmentStore' }
  )
);
