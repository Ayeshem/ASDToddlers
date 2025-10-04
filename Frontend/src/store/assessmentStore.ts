import { create } from 'zustand';
import type { Assessment } from '@/types';

interface AssessmentState {
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  getAssessmentsByChild: (childId: string) => Assessment[];
  getRecentAssessments: (limit?: number) => Assessment[];
  addDoctorComment: (assessmentId: string, comment: string) => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: [],

  addAssessment: (assessment) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: Date.now().toString(),
    };
    set((state) => ({
      assessments: [...state.assessments, newAssessment],
    }));
  },

  updateAssessment: (id, updates) => {
    set((state) => ({
      assessments: state.assessments.map((assessment) =>
        assessment.id === id ? { ...assessment, ...updates } : assessment
      ),
    }));
  },

  getAssessmentsByChild: (childId) => {
    return get().assessments.filter((assessment) => assessment.childId === childId);
  },

  getRecentAssessments: (limit = 10) => {
    return get()
      .assessments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, limit);
  },

  addDoctorComment: (assessmentId, comment) => {
    set((state) => ({
      assessments: state.assessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, doctorComments: comment }
          : assessment
      ),
    }));
  },
}));
