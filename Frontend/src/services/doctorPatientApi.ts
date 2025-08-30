const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauderdale-pieces-leaders-max.trycloudflare.com';

export interface Child {
  id: string;
  name: string;
  dob: string;
  parent_id: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

export interface Report {
  id: string;
  child_id: string;
  predicted_class: string;
  confidence: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  scanpath_path: string;
  heatmap_path: string;
  gaze_data_path: string;
  created_at: string;
}

export interface RiskCounts {
  risk_level: string;
  count: number;
}

class DoctorPatientApi {
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
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all children (patients)
  async getAllChildren(): Promise<{ children: Child[] }> {
    return this.request<{ children: Child[] }>('/children');
  }

  // Get single child by ID
  async getChildById(childId: string): Promise<Child> {
    return this.request<Child>(`/child/${childId}`);
  }

  // Get children count
  async getChildrenCount(): Promise<{ total_children: number }> {
    return this.request<{ total_children: number }>('/children/count');
  }

  // Get latest report for a child
  async getLatestReport(childId: string): Promise<Report> {
    return this.request<Report>(`/get-report/${childId}`);
  }

  // Get all reports for a child
  async getAllReports(childId: string): Promise<Report[]> {
    return this.request<Report[]>(`/get-all-reports/${childId}`);
  }

  // Get risk level counts
  async getLowRiskCount(): Promise<RiskCounts> {
    return this.request<RiskCounts>('/count-low-risk');
  }

  async getModerateRiskCount(): Promise<RiskCounts> {
    return this.request<RiskCounts>('/count-moderate-risk');
  }

  async getHighRiskCount(): Promise<RiskCounts> {
    return this.request<RiskCounts>('/count-high-risk');
  }

  // Get doctor count
  async getDoctorCount(): Promise<{ total_doctors: number }> {
    return this.request<{ total_doctors: number }>('/doctors-count');
  }

  // Map risk level from API to frontend format
  mapRiskLevel(apiRiskLevel: string): 'low' | 'moderate' | 'high' {
    switch (apiRiskLevel.toLowerCase()) {
      case 'low': return 'low';
      case 'moderate': return 'moderate';
      case 'high': return 'high';
      default: return 'low';
    }
  }

  // Get comprehensive patient data with latest report
  async getPatientWithLatestReport(childId: string): Promise<Child & { latestReport?: Report }> {
    try {
      const [child, latestReport] = await Promise.allSettled([
        this.getChildById(childId),
        this.getLatestReport(childId)
      ]);

      const childData = child.status === 'fulfilled' ? child.value : null;
      const reportData = latestReport.status === 'fulfilled' ? latestReport.value : null;

      if (!childData) {
        throw new Error('Child not found');
      }

      return {
        ...childData,
        riskLevel: reportData ? this.mapRiskLevel(reportData.risk_level) : undefined,
        latestReport: reportData || undefined
      };
    } catch (error) {
      console.error(`Failed to get patient with latest report for child ${childId}:`, error);
      throw error;
    }
  }

  // Get all patients with their latest reports
  async getAllPatientsWithReports(): Promise<(Child & { latestReport?: Report })[]> {
    try {
      const { children } = await this.getAllChildren();
      
      // Get latest reports for all children in parallel
      const patientsWithReports = await Promise.allSettled(
        children.map(async (child) => {
          try {
            const latestReport = await this.getLatestReport(child.id);
            return {
              ...child,
              riskLevel: this.mapRiskLevel(latestReport.risk_level),
              latestReport
            };
          } catch (error) {
            // If no report found, return child without report
            return {
              ...child,
              riskLevel: undefined as 'low' | 'moderate' | 'high' | undefined,
              latestReport: undefined
            };
          }
        })
      );

      return patientsWithReports
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<Child & { latestReport?: Report }>).value);
    
    } catch (error) {
      console.error('Failed to get all patients with reports:', error);
      throw error;
    }
  }
}

export const doctorPatientApi = new DoctorPatientApi();
