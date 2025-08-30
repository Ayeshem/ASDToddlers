const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface StimuliVideo {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration?: string;
  video_url: string;
}

export interface CreateStimuliRequest {
  title: string;
  description?: string;
  category: string;
  duration?: string;
  video_url?: string;
  video_file?: File;
}

export interface UpdateStimuliRequest {
  title?: string;
  description?: string;
  category?: string;
  duration?: string;
  video_url?: string;
}

export interface ApiError {
  error: string;
}

class StimuliApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllStimuli(): Promise<StimuliVideo[]> {
    return this.request<StimuliVideo[]>("/all-stimuli");
  }

  async getStimuliById(id: string): Promise<StimuliVideo> {
    return this.request<StimuliVideo>(`/stimuli/${id}`);
  }

  async createStimuli(data: CreateStimuliRequest): Promise<{ message: string; video_id?: number; video_url?: string }> {
    // Check if we have a video file to upload
    if (data.video_file) {
      // Handle file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('duration', data.duration || '');
      formData.append('video', data.video_file);

      const url = `${API_BASE_URL}/add-stimuli`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } else {
      // Handle JSON request (without file)
      return this.request<{ message: string; video_id?: number; video_url?: string }>("/add-stimuli", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
  }

  async updateStimuli(id: string, data: UpdateStimuliRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/stimuli/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteStimuli(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/stimuli/${id}`, {
      method: "DELETE",
    });
  }

  async uploadVideo(file: File): Promise<{ message: string; file_path: string; filename: string }> {
    const formData = new FormData();
    formData.append('video', file);

    const url = `${API_BASE_URL}/upload-video`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const stimuliApi = new StimuliApi(); 