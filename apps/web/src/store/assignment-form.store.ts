import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AssignmentFormData } from '@/lib/schemas/assignment-form.schema';

interface AssignmentFormState {
  currentStep: number;
  formData: Omit<AssignmentFormData, 'file'>; // exclude file from persistence since FileLists/Files cannot be serialized
  uploadProgress: number;
  fileName: string | null;
  fileSize: number | null;
  isDraftSaved: boolean;
  
  // Actions
  setStep: (step: number) => void;
  updateFormData: (data: Partial<Omit<AssignmentFormData, 'file'>>) => void;
  setUploadedFile: (name: string | null, size: number | null) => void;
  setUploadProgress: (progress: number) => void;
  setDraftSaved: (saved: boolean) => void;
  resetForm: () => void;
}

const initialFormData: Omit<AssignmentFormData, 'file'> = {
  title: '',
  subject: '',
  classGrade: '',
  dueDate: '',
  questionTypes: ['mcq'],
  numberOfQuestions: 10,
  marks: 20,
  difficultyDistribution: {
    beginner: 30,
    intermediate: 50,
    expert: 20,
  },
  additionalInstructions: '',
};

export const useAssignmentFormStore = create<AssignmentFormState>()(
  devtools(
    persist(
      (set) => ({
        currentStep: 0,
        formData: initialFormData,
        uploadProgress: 0,
        fileName: null,
        fileSize: null,
        isDraftSaved: false,

        setStep: (currentStep) => set({ currentStep }, false, 'form/setStep'),
        
        updateFormData: (data) =>
          set(
            (state) => ({
              formData: { ...state.formData, ...data },
              isDraftSaved: true,
            }),
            false,
            'form/updateFormData'
          ),
          
        setUploadedFile: (fileName, fileSize) =>
          set({ fileName, fileSize }, false, 'form/setUploadedFile'),
          
        setUploadProgress: (uploadProgress) =>
          set({ uploadProgress }, false, 'form/setUploadProgress'),
          
        setDraftSaved: (isDraftSaved) => set({ isDraftSaved }, false, 'form/setDraftSaved'),
        
        resetForm: () =>
          set(
            {
              currentStep: 0,
              formData: initialFormData,
              fileName: null,
              fileSize: null,
              uploadProgress: 0,
              isDraftSaved: false,
            },
            false,
            'form/resetForm'
          ),
      }),
      {
        name: 'veda-assignment-draft',
        partialize: (state) => ({
          currentStep: state.currentStep,
          formData: state.formData,
          fileName: state.fileName,
          fileSize: state.fileSize,
        }),
      }
    ),
    { name: 'AssignmentFormStore' }
  )
);
