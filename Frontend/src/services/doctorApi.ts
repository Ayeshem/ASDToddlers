const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Doctor {
  id: string;
  full_name: string;
  email: string;
  specialization: string;
  status: 'active' | 'inactive';
}

export interface CreateDoctorRequest {
  full_name: string;
  email: string;
  specialization: string;
  password: string;
}

export interface UpdateDoctorRequest {
  full_name?: string;
  email?: string;
  specialization?: string;
  status?: 'active' | 'inactive';
}

export interface ApiError {
  error: string;
  details?: string;
}

class DoctorApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    return this.request<Doctor[]>('/all-doctors', {
      method: 'GET',
    });
  }

  // Get a single doctor by ID
  async getDoctorById(doctorId: string): Promise<Doctor> {
    return this.request<Doctor>(`/doctor/${doctorId}`, {
      method: 'GET',
    });
  }

  // Create a new doctor
  async createDoctor(data: CreateDoctorRequest): Promise<{ message: string; doctor_id: number }> {
    return this.request<{ message: string; doctor_id: number }>('/create-doctor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a doctor
  async updateDoctor(doctorId: string, data: UpdateDoctorRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/doctor/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete a doctor
  async deleteDoctor(doctorId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/doctor/${doctorId}`, {
      method: 'DELETE',
    });
  }

  // Toggle doctor status
  async toggleDoctorStatus(doctorId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/doctors/${doctorId}/toggle-status`, {
      method: 'PATCH',
    });
  }
}

export const doctorApi = new DoctorApi();
