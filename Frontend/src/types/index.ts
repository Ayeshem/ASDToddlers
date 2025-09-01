// export type UserRole = 'parent' | 'doctor' | 'admin';

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
// }

// export interface Child {
//   id: string;
//   name: string;
//   dob: string; // Backend returns "dob" not "dateOfBirth"
//   parent_id?: string;
//   riskLevel?: RiskLevel; // Optional for backward compatibility
//   assessmentCount?: number; // Optional for backward compatibility
//   lastAssessment?: string; // Optional for backward compatibility
// }

// export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high';

// export interface Assessment {
//   id: string;
//   childId: string;
//   doctorId?: string;
//   date: string;
//   riskLevel: RiskLevel;
//   fixationCount: number;
//   gazeDeviation: number;
//   scanpathImage?: string;
//   heatmapImage?: string;
//   doctorComments?: string;
//   stimulusId: string;
// }

// export interface Stimulus {
//   id: string;
//   title: string;
//   description: string;
//   videoUrl: string;
//   thumbnailUrl: string;
//   duration: number;
//   category: string;
// }

// export interface Doctor {
//   id: string;
//   name: string;
//   email: string;
//   specialization: string;
//   isActive: boolean;
// }

// export interface Appointment {
//   id: string;
//   doctorId: string;
//   childId: string;
//   parentId: string;
//   date: string;
//   time: string;
//   status: 'scheduled' | 'completed' | 'cancelled';
//   notes?: string;
// }

// export interface GazeData {
//   x: number;
//   y: number;
//   timestamp: number;
// }

// export interface SessionData {
//   sessionId: string;
//   childId: string;
//   stimulusId: string;
//   startTime: string;
//   endTime?: string;
//   gazeData: GazeData[];
//   isActive: boolean;
// }




export type UserRole = 'parent' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Child {
  id: string;
  name: string;
  dob: string; // Backend returns "dob" not "dateOfBirth"
  parent_id?: string;
  riskLevel?: RiskLevel; // Optional for backward compatibility
  assessmentCount?: number; // Optional for backward compatibility
  lastAssessment?: string; // Optional for backward compatibility

  // Photo fields (optional)
  photo?: string;    // raw path returned by backend, e.g. "/children/20250831_...jpg"
  photoUrl?: string; // full URL for direct use in <img src={child.photoUrl} />
}

export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high';

export interface Assessment {
  id: string;
  childId: string;
  doctorId?: string;
  date: string;
  riskLevel: RiskLevel;
  fixationCount: number;
  gazeDeviation: number;
  scanpathImage?: string;
  heatmapImage?: string;
  doctorComments?: string;
  stimulusId: string;
}

export interface Stimulus {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  childId: string;
  parentId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  childId: string;
  stimulusId: string;
  startTime: string;
  endTime?: string;
  gazeData: GazeData[];
  isActive: boolean;
}
