import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Assessment } from '@veda-ai/types';

type AssessmentView = 'grid' | 'list';
type AssessmentFilter = 'all' | 'draft' | 'published' | 'archived';

interface AssessmentState {
  assessments: Assessment[];
  selectedAssessment: Assessment | null;
  isLoading: boolean;
  view: AssessmentView;
  filter: AssessmentFilter;
  searchQuery: string;

  // Actions
  setAssessments: (assessments: Assessment[]) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (id: string, partial: Partial<Assessment>) => void;
  removeAssessment: (id: string) => void;
  setSelectedAssessment: (assessment: Assessment | null) => void;
  setLoading: (loading: boolean) => void;
  setView: (view: AssessmentView) => void;
  setFilter: (filter: AssessmentFilter) => void;
  setSearchQuery: (query: string) => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    (set) => ({
      assessments: [],
      selectedAssessment: null,
      isLoading: false,
      view: 'grid',
      filter: 'all',
      searchQuery: '',

      setAssessments: (assessments) =>
        set({ assessments }, false, 'assessment/setAssessments'),

      addAssessment: (assessment) =>
        set(
          (state) => ({ assessments: [assessment, ...state.assessments] }),
          false,
          'assessment/addAssessment'
        ),

      updateAssessment: (id, partial) =>
        set(
          (state) => ({
            assessments: state.assessments.map((a) =>
              a._id === id ? { ...a, ...partial } : a
            ),
          }),
          false,
          'assessment/updateAssessment'
        ),

      removeAssessment: (id) =>
        set(
          (state) => ({ assessments: state.assessments.filter((a) => a._id !== id) }),
          false,
          'assessment/removeAssessment'
        ),

      setSelectedAssessment: (assessment) =>
        set({ selectedAssessment: assessment }, false, 'assessment/setSelected'),

      setLoading: (isLoading) => set({ isLoading }, false, 'assessment/setLoading'),

      setView: (view) => set({ view }, false, 'assessment/setView'),

      setFilter: (filter) => set({ filter }, false, 'assessment/setFilter'),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }, false, 'assessment/setSearchQuery'),
    }),
    { name: 'AssessmentStore' }
  )
);
