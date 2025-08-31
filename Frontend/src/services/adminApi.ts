const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauderdale-pieces-leaders-max.trycloudflare.com';

// Import existing types
export type { Child, Report } from './doctorPatientApi';
export type { Doctor } from './doctorApi';
export type { GazeResult } from './gazeApi';

// Additional admin-specific types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'parent' | 'doctor' | 'admin';
}

export interface StimuliVideo {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration?: number;
  video_url: string;
  uploaded_by?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalDoctors: number;
  totalChildren: number;
  totalAssessments: number;
  totalStimuli: number;
  safeRiskCount: number;
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface CreateStimuliRequest {
  title: string;
  description?: string;
  category: string;
  duration?: number;
  video_url: string;
  uploaded_by?: string;
}

export interface UpdateStimuliRequest {
  title?: string;
  description?: string;
  category?: string;
  duration?: number;
}

class AdminApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Admin API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // =============================================================================
  // COMPREHENSIVE SYSTEM STATISTICS
  // =============================================================================

  async getSystemStats(): Promise<SystemStats> {
    try {
      const [
        childrenCount,
        doctorCount,
        safeRisk,
        lowRisk,
        moderateRisk,
        highRisk,
        stimuliData
      ] = await Promise.allSettled([
        this.request<{ total_children: number }>('/children/count'),
        this.request<{ total_doctors: number }>('/doctors-count'),
        this.request<{ count: number }>('/count-safe-risk'),   // ✅ safe
        this.request<{ count: number }>('/count-low-risk'),
        this.request<{ count: number }>('/count-moderate-risk'),
        this.request<{ count: number }>('/count-high-risk'),
        this.request<StimuliVideo[]>('/all-stimuli')
      ]);

      const totalChildren = childrenCount.status === 'fulfilled' ? childrenCount.value.total_children : 0;
      const totalDoctors = doctorCount.status === 'fulfilled' ? doctorCount.value.total_doctors : 0;
      const safeRiskCount = safeRisk.status === 'fulfilled' ? safeRisk.value.count : 0;   // ✅ safe
      const lowRiskCount = lowRisk.status === 'fulfilled' ? lowRisk.value.count : 0;
      const moderateRiskCount = moderateRisk.status === 'fulfilled' ? moderateRisk.value.count : 0;
      const highRiskCount = highRisk.status === 'fulfilled' ? highRisk.value.count : 0;
      const totalStimuli = stimuliData.status === 'fulfilled' ? stimuliData.value.length : 0;

      const totalAssessments = safeRiskCount + lowRiskCount + moderateRiskCount + highRiskCount;   // ✅ safe included
      const totalUsers = totalChildren + totalDoctors; // Simplified calculation

      // Determine system health based on data
      let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
      if (highRiskCount > totalAssessments * 0.3) systemHealth = 'critical';
      else if (highRiskCount > totalAssessments * 0.2) systemHealth = 'warning';
      else if (totalAssessments > 0) systemHealth = 'good';

      return {
        totalUsers,
        totalDoctors,
        totalChildren,
        totalAssessments,
        totalStimuli,
        safeRiskCount,   // ✅ include safe
        lowRiskCount,
        moderateRiskCount,
        highRiskCount,
        systemHealth
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }

  // =============================================================================
  // CHILDREN MANAGEMENT (Admin can see all children)
  // =============================================================================

  async getAllChildren(): Promise<{ children: Child[] }> {
    return this.request<{ children: Child[] }>('/children');
  }

  async getChildById(childId: string): Promise<Child> {
    return this.request<Child>(`/child/${childId}`);
  }

  async getChildrenCount(): Promise<{ total_children: number }> {
    return this.request<{ total_children: number }>('/children/count');
  }

  // =============================================================================
  // DOCTOR MANAGEMENT (Admin can manage all doctors)
  // =============================================================================

  async getAllDoctors(): Promise<Doctor[]> {
    return this.request<Doctor[]>('/all-doctors');
  }

  async getDoctorById(doctorId: string): Promise<Doctor> {
    return this.request<Doctor>(`/doctor/${doctorId}`);
  }

  async addDoctor(data: {
    name: string;
    email: string;
    password: string;
    specialization: string;
    status?: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/add-doctor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(doctorId: string, data: {
    name?: string;
    email?: string;
    specialization?: string;
    status?: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/doctor/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctor(doctorId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/doctors/${doctorId}`, {
      method: 'DELETE',
    });
  }

  async toggleDoctorStatus(doctorId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/doctors/${doctorId}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getDoctorCount(): Promise<{ total_doctors: number }> {
    return this.request<{ total_doctors: number }>('/doctors-count');
  }

  // =============================================================================
  // STIMULI MANAGEMENT (Admin can manage all stimuli)
  // =============================================================================

  async getAllStimuli(): Promise<StimuliVideo[]> {
    return this.request<StimuliVideo[]>('/all-stimuli');
  }

  async getStimuliById(stimuliId: string): Promise<StimuliVideo> {
    return this.request<StimuliVideo>(`/stimuli/${stimuliId}`);
  }

  async addStimuli(data: CreateStimuliRequest): Promise<{ message: string; video_id: number; video_url: string }> {
    return this.request<{ message: string; video_id: number; video_url: string }>('/add-stimuli', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStimuli(stimuliId: string, data: UpdateStimuliRequest): Promise<{ message: string }> {
    // Note: This endpoint expects form data in your Flask app, but we'll use JSON for consistency
    return this.request<{ message: string }>(`/stimuli/${stimuliId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStimuli(stimuliId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/stimuli/${stimuliId}`, {
      method: 'DELETE',
    });
  }

  // =============================================================================
  // REPORTS & ASSESSMENTS (Admin can see all reports)
  // =============================================================================

  async getLatestReport(childId: string): Promise<GazeResult> {
    return this.request<GazeResult>(`/get-report/${childId}`);
  }

  async getAllReports(childId: string): Promise<GazeResult[]> {
    return this.request<GazeResult[]>(`/get-all-reports/${childId}`);
  }

  async getSafeRiskCount(): Promise<{ risk_level: string; count: number }> {
    return this.request<{ risk_level: string; count: number }>('/count-safe-risk');
  }

  async getLowRiskCount(): Promise<{ risk_level: string; count: number }> {
    return this.request<{ risk_level: string; count: number }>('/count-low-risk');
  }

  async getModerateRiskCount(): Promise<{ risk_level: string; count: number }> {
    return this.request<{ risk_level: string; count: number }>('/count-moderate-risk');
  }

  async getHighRiskCount(): Promise<{ risk_level: string; count: number }> {
    return this.request<{ risk_level: string; count: number }>('/count-high-risk');
  }

  // Get all reports for all children (admin overview)
  async getAllSystemReports(): Promise<{ child: Child; reports: GazeResult[] }[]> {
    try {
      const { children } = await this.getAllChildren();
      
      const childrenWithReports = await Promise.allSettled(
        children.map(async (child) => {
          try {
            const reports = await this.getAllReports(child.id);
            return { child, reports };
          } catch (error) {
            return { child, reports: [] };
          }
        })
      );

      return childrenWithReports
        .filter((result): result is PromiseFulfilledResult<{ child: Child; reports: GazeResult[] }> => 
          result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Failed to get all system reports:', error);
      throw error;
    }
  }

  // Get recent reports across all children
  async getRecentSystemReports(limit: number = 10): Promise<(GazeResult & { childName?: string })[]> {
    try {
      const allChildrenWithReports = await this.getAllSystemReports();
      
      const allReports: (GazeResult & { childName?: string })[] = [];
      
      allChildrenWithReports.forEach(({ child, reports }) => {
        reports.forEach(report => {
          allReports.push({
            ...report,
            childName: child.name
          });
        });
      });

      // Sort by created_at (most recent first) and limit
      return allReports
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent system reports:', error);
      throw error;
    }
  }

  // =============================================================================
  // SESSION MANAGEMENT (Admin can monitor sessions)
  // =============================================================================

  async getSessionStatus(): Promise<{ status: string; session?: any }> {
    return this.request<{ status: string; session?: any }>('/status');
  }

  async startSession(data: {
    child_id: string;
    stimulus_id: string;
    session_type?: string;
  }): Promise<{ status: string; message: string; child_id: string; stimulus_id: string; session_type: string }> {
    return this.request<{ status: string; message: string; child_id: string; stimulus_id: string; session_type: string }>('/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async stopSession(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/stop', {
      method: 'POST',
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Map risk level from API to frontend format
  mapRiskLevel(apiRiskLevel: string): 'low' | 'moderate' | 'high' {
    switch (apiRiskLevel.toLowerCase()) {
      case 'safe': return 'safe';      // ✅ added
      case 'low': return 'low';
      case 'moderate': return 'moderate';
      case 'high': return 'high';
      default: return 'low';
    }
  }

  // Get comprehensive dashboard data
  async getDashboardData(): Promise<{
    stats: SystemStats;
    recentReports: (Report & { childName?: string })[];
    allChildren: Child[];
    allDoctors: Doctor[];
    allStimuli: StimuliVideo[];
    sessionStatus: { status: string; session?: any };
  }> {
    try {
      const [
        stats,
        recentReports,
        childrenData,
        doctors,
        stimuli,
        sessionStatus
      ] = await Promise.allSettled([
        this.getSystemStats(),
        this.getRecentSystemReports(5),
        this.getAllChildren(),
        this.getAllDoctors(),
        this.getAllStimuli(),
        this.getSessionStatus()
      ]);

      return {
        stats: stats.status === 'fulfilled' ? stats.value : {
          totalUsers: 0, totalDoctors: 0, totalChildren: 0, totalAssessments: 0,
          totalStimuli: 0, safeRiskCount: 0, lowRiskCount: 0, moderateRiskCount: 0, highRiskCount: 0,
          systemHealth: 'warning' as const
        },
        recentReports: recentReports.status === 'fulfilled' ? recentReports.value : [],
        allChildren: childrenData.status === 'fulfilled' ? childrenData.value.children : [],
        allDoctors: doctors.status === 'fulfilled' ? doctors.value : [],
        allStimuli: stimuli.status === 'fulfilled' ? stimuli.value : [],
        sessionStatus: sessionStatus.status === 'fulfilled' ? sessionStatus.value : { status: 'unknown' }
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminApi();
