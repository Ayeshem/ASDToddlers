// import { create } from 'zustand';
// import type { Assessment } from '@/types';

// interface AssessmentState {
//   assessments: Assessment[];
//   addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
//   updateAssessment: (id: string, updates: Partial<Assessment>) => void;
//   getAssessmentsByChild: (childId: string) => Assessment[];
//   getRecentAssessments: (limit?: number) => Assessment[];
//   addDoctorComment: (assessmentId: string, comment: string) => void;
// }

// // Mock data
// const mockAssessments: Assessment[] = [
//   {
//     id: '1',
//     childId: '1',
//     doctorId: '2',
//     date: '2024-07-10',
//     riskLevel: 'low',
//     fixationCount: 45,
//     gazeDeviation: 12.5,
//     scanpathImage: '/api/placeholder/400/300',
//     heatmapImage: '/api/placeholder/400/300',
//     doctorComments: 'Good eye contact patterns observed. Typical fixation behavior.',
//     stimulusId: 'stim1',
//   },
//   {
//     id: '2',
//     childId: '2',
//     doctorId: '2',
//     date: '2024-07-08',
//     riskLevel: 'moderate',
//     fixationCount: 28,
//     gazeDeviation: 24.8,
//     scanpathImage: '/api/placeholder/400/300',
//     heatmapImage: '/api/placeholder/400/300',
//     doctorComments: 'Some attention deviation noted. Recommend follow-up assessment.',
//     stimulusId: 'stim2',
//   },
// ];

// export const useAssessmentStore = create<AssessmentState>((set, get) => ({
//   assessments: mockAssessments,
  
//   addAssessment: (assessment) => {
//     const newAssessment: Assessment = {
//       ...assessment,
//       id: Date.now().toString(),
//     };
//     set(state => ({
//       assessments: [...state.assessments, newAssessment],
//     }));
//   },
  
//   updateAssessment: (id, updates) => {
//     set(state => ({
//       assessments: state.assessments.map(assessment =>
//         assessment.id === id ? { ...assessment, ...updates } : assessment
//       ),
//     }));
//   },
  
//   getAssessmentsByChild: (childId) => {
//     return get().assessments.filter(assessment => assessment.childId === childId);
//   },
  
//   getRecentAssessments: (limit = 10) => {
//     return get().assessments
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//       .slice(0, limit);
//   },
  
//   addDoctorComment: (assessmentId, comment) => {
//     set(state => ({
//       assessments: state.assessments.map(assessment =>
//         assessment.id === assessmentId 
//           ? { ...assessment, doctorComments: comment }
//           : assessment
//       ),
//     }));
//   },
// }));

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

// Mock data
const mockAssessments: Assessment[] = [
  {
    id: '1',
    childId: '1',
    doctorId: '2',
    date: '2024-07-10',
    riskLevel: 'low',
    fixationCount: 45,
    gazeDeviation: 12.5,
    scanpathImage: '/api/placeholder/400/300',
    heatmapImage: '/api/placeholder/400/300',
    doctorComments: 'Good eye contact patterns observed. Typical fixation behavior.',
    stimulusId: 'stim1',
  },
  {
    id: '2',
    childId: '2',
    doctorId: '2',
    date: '2024-07-08',
    riskLevel: 'moderate',
    fixationCount: 28,
    gazeDeviation: 24.8,
    scanpathImage: '/api/placeholder/400/300',
    heatmapImage: '/api/placeholder/400/300',
    doctorComments: 'Some attention deviation noted. Recommend follow-up assessment.',
    stimulusId: 'stim2',
  },
  {
    id: '3',
    childId: '3',
    doctorId: '1',
    date: '2024-07-05',
    riskLevel: 'safe',
    fixationCount: 55,
    gazeDeviation: 10.1,
    scanpathImage: '/api/placeholder/400/300',
    heatmapImage: '/api/placeholder/400/300',
    doctorComments: 'No atypical patterns detected. Development appears on track.',
    stimulusId: 'stim3',
  },
];

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: mockAssessments,
  
  addAssessment: (assessment) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: Date.now().toString(),
    };
    set(state => ({
      assessments: [...state.assessments, newAssessment],
    }));
  },
  
  updateAssessment: (id, updates) => {
    set(state => ({
      assessments: state.assessments.map(assessment =>
        assessment.id === id ? { ...assessment, ...updates } : assessment
      ),
    }));
  },
  
  getAssessmentsByChild: (childId) => {
    return get().assessments.filter(assessment => assessment.childId === childId);
  },
  
  getRecentAssessments: (limit = 10) => {
    return get().assessments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
  
  addDoctorComment: (assessmentId, comment) => {
    set(state => ({
      assessments: state.assessments.map(assessment =>
        assessment.id === assessmentId 
          ? { ...assessment, doctorComments: comment }
          : assessment
      ),
    }));
  },
}));
