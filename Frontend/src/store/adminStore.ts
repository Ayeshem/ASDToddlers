import { create } from 'zustand';
import type { User, Doctor, Assessment, Stimulus, Appointment } from '@/types';

interface AdminState {
  // System statistics
  systemStats: {
    totalUsers: number;
    totalDoctors: number;
    totalAssessments: number;
    totalStimuli: number;
    totalAppointments: number;
    activeUsers: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
  
  // Admin actions
  updateSystemStats: (stats: Partial<AdminState['systemStats']>) => void;
  triggerSystemBackup: () => Promise<void>;
  triggerMaintenanceMode: (enabled: boolean) => Promise<void>;
  retrainMLModel: () => Promise<void>;
  generateSystemReport: () => Promise<string>;
  
  // User management
  getAllUsers: () => Promise<User[]>;
  deactivateUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  
  // System monitoring
  getSystemLogs: () => Promise<any[]>;
  clearSystemLogs: () => Promise<void>;
}

// Mock system statistics
const mockSystemStats = {
  totalUsers: 156,
  totalDoctors: 12,
  totalAssessments: 342,
  totalStimuli: 24,
  totalAppointments: 89,
  activeUsers: 23,
  systemHealth: 'excellent' as const,
};

export const useAdminStore = create<AdminState>((set, get) => ({
  systemStats: mockSystemStats,
  
  updateSystemStats: (stats) => {
    set((state) => ({
      systemStats: { ...state.systemStats, ...stats }
    }));
  },
  
  triggerSystemBackup: async () => {
    // Mock backup process
    console.log('Starting system backup...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('System backup completed');
  },
  
  triggerMaintenanceMode: async (enabled) => {
    // Mock maintenance mode toggle
    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  
  retrainMLModel: async () => {
    // Mock ML model retraining
    console.log('Starting ML model retraining...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('ML model retraining completed');
  },
  
  generateSystemReport: async () => {
    // Mock report generation
    const stats = get().systemStats;
    const report = `
      System Report - ${new Date().toLocaleDateString()}
      
      Total Users: ${stats.totalUsers}
      Total Doctors: ${stats.totalDoctors}
      Total Assessments: ${stats.totalAssessments}
      Total Stimuli: ${stats.totalStimuli}
      Total Appointments: ${stats.totalAppointments}
      Active Users: ${stats.activeUsers}
      System Health: ${stats.systemHealth}
      
      Generated at: ${new Date().toISOString()}
    `;
    return report;
  },
  
  getAllUsers: async () => {
    // Mock user data
    return [
      { id: '1', email: 'parent@test.com', name: 'Sarah Johnson', role: 'parent' },
      { id: '2', email: 'doctor@test.com', name: 'Dr. Michael Chen', role: 'doctor' },
      { id: 'admin', email: 'admin@gmail.com', name: 'System Administrator', role: 'admin' },
    ];
  },
  
  deactivateUser: async (userId: string) => {
    console.log(`Deactivating user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  
  activateUser: async (userId: string) => {
    console.log(`Activating user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  
  getSystemLogs: async () => {
    // Mock system logs
    return [
      { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'System backup completed successfully' },
      { id: '2', timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'User login: admin@gmail.com' },
      { id: '3', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'warning', message: 'High memory usage detected' },
      { id: '4', timestamp: new Date(Date.now() - 180000).toISOString(), level: 'info', message: 'ML model retraining completed' },
    ];
  },
  
  clearSystemLogs: async () => {
    console.log('Clearing system logs...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('System logs cleared');
  },
})); 