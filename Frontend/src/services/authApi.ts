const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

export interface LoginRequest {
  email: string;
  password: string;
  role: 'parent' | 'doctor' | 'admin';
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'parent' | 'doctor';
}

export interface AuthResponse {
  message: string;
  role?: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}

class AuthApi {
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

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/logout', {
      method: 'POST',
    });
  }

  async checkAuth(): Promise<{ isAuthenticated: boolean; user?: any }> {
    try {
      const response = await this.request<{ isAuthenticated: boolean; user?: any }>('/session-check');
      return response;
    } catch (error) {
      console.error('Session check failed:', error);
      return { isAuthenticated: false };
    }
  }
}

export const authApi = new AuthApi(); 