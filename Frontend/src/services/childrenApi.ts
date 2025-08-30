const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

export interface Child {
  id: string;
  name: string;
  dob: string; // Backend returns "dob" not "dateOfBirth"
  parent_id?: string; // Backend includes this in some responses
}

export interface CreateChildRequest {
  name: string;
  dob: string; // YYYY-MM-DD format
}

export interface UpdateChildRequest {
  name?: string;
  dob?: string; // YYYY-MM-DD format
}

export interface ApiError {
  error: string;
  details?: string;
}

class ChildrenApi {
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

  // Add a new child
  async addChild(parentId: string, data: CreateChildRequest): Promise<{ message: string; child_id: number }> {
    return this.request<{ message: string; child_id: number }>(`/parent/${parentId}/child`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get all children for a parent
  async getChildrenByParent(parentId: string): Promise<Child[]> {
    return this.request<Child[]>(`/parent/${parentId}/children`, {
      method: 'GET',
    });
  }

  // Update a child
  async updateChild(parentId: string, childId: string, data: UpdateChildRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/parent/${parentId}/child/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete a child
  async deleteChild(parentId: string, childId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/parent/${parentId}/child/${childId}`, {
      method: 'DELETE',
    });
  }

  // Get all children (admin route)
  async getAllChildren(): Promise<{ children: Child[] }> {
    return this.request<{ children: Child[] }>('/children', {
      method: 'GET',
    });
  }

  // Get a single child by ID
  async getChildById(childId: string): Promise<Child> {
    return this.request<Child>(`/child/${childId}`, {
      method: 'GET',
    });
  }
}

export const childrenApi = new ChildrenApi(); 