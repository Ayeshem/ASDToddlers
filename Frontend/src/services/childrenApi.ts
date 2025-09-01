// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

// export interface Child {
//   id: string;
//   name: string;
//   dob: string; // Backend returns "dob" not "dateOfBirth"
//   parent_id?: string; // Backend includes this in some responses
// }

// export interface CreateChildRequest {
//   name: string;
//   dob: string; // YYYY-MM-DD format
// }

// export interface UpdateChildRequest {
//   name?: string;
//   dob?: string; // YYYY-MM-DD format
// }

// export interface ApiError {
//   error: string;
//   details?: string;
// }

// class ChildrenApi {
//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<T> {
//     const url = `${API_BASE_URL}${endpoint}`;
    
//     const config: RequestInit = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     };

//     try {
//       const response = await fetch(url, config);
      
//       if (!response.ok) {
//         const errorData: ApiError = await response.json();
//         throw new Error(errorData.error || `HTTP ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       if (error instanceof Error) {
//         throw error;
//       }
//       throw new Error('Network error occurred');
//     }
//   }

//   // Add a new child
//   async addChild(parentId: string, data: CreateChildRequest): Promise<{ message: string; child_id: number }> {
//     return this.request<{ message: string; child_id: number }>(`/parent/${parentId}/child`, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   // Get all children for a parent
//   async getChildrenByParent(parentId: string): Promise<Child[]> {
//     return this.request<Child[]>(`/parent/${parentId}/children`, {
//       method: 'GET',
//     });
//   }

//   // Update a child
//   async updateChild(parentId: string, childId: string, data: UpdateChildRequest): Promise<{ message: string }> {
//     return this.request<{ message: string }>(`/parent/${parentId}/child/${childId}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   }

//   // Delete a child
//   async deleteChild(parentId: string, childId: string): Promise<{ message: string }> {
//     return this.request<{ message: string }>(`/parent/${parentId}/child/${childId}`, {
//       method: 'DELETE',
//     });
//   }

//   // Get all children (admin route)
//   async getAllChildren(): Promise<{ children: Child[] }> {
//     return this.request<{ children: Child[] }>('/children', {
//       method: 'GET',
//     });
//   }

//   // Get a single child by ID
//   async getChildById(childId: string): Promise<Child> {
//     return this.request<Child>(`/child/${childId}`, {
//       method: 'GET',
//     });
//   }
// }

// export const childrenApi = new ChildrenApi(); 



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface Child {
  id: string;
  name: string;
  dob: string; // Backend returns "dob" not "dateOfBirth"
  parent_id?: string; // Backend includes this in some responses
  photo?: string; // raw path returned by backend, e.g. "/children/20250831_...jpg"
  photoUrl?: string; // full URL (API_BASE_URL + photo) for direct use in <img src=...>
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

    // Clone options to avoid mutating caller's object
    const opts: any = { ...options };

    // Prepare headers object (do not force Content-Type if sending FormData)
    const headers: Record<string, string> = {
      ...(opts.headers || {}),
    };

    // Handle body: if FormData => leave it as-is and do not set Content-Type.
    // If body is an object (and not FormData/string), stringify it.
    let body = opts.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    if (!isFormData && body !== undefined && typeof body === "object" && !(body instanceof String)) {
      // JSON object -> stringify and set header if not provided
      body = JSON.stringify(body);
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    } else {
      // body is FormData OR string OR undefined
      // If it's a plain string and no Content-Type provided, assume json (this preserves older usage where callers passed JSON.stringify)
      if (typeof body === "string" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    }

    const config: RequestInit = {
      ...opts,
      headers,
      body,
    };

    try {
      const response = await fetch(url, config);
      // try to parse JSON if possible; if response has no body, this will throw -> let caller handle
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // not JSON
        data = text;
      }

      if (!response.ok) {
        const errorData: ApiError = data || { error: `HTTP ${response.status}` };
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Add a new child
  // Accepts either CreateChildRequest (JSON) or FormData (for image upload)
  async addChild(
    parentId: string,
    data: CreateChildRequest | FormData
  ): Promise<{ message: string; child_id: number; photo?: string } | any> {
    const isForm = typeof FormData !== "undefined" && data instanceof FormData;
    const options: RequestInit = {
      method: "POST",
      body: data as any,
    };
    // request() will handle stringifying JSON or leaving FormData alone
    const resp = await this.request<any>(`/parent/${parentId}/child`, options);
    return resp;
  }

  // Get all children for a parent
  async getChildrenByParent(parentId: string): Promise<Child[]> {
    const data = await this.request<Child[]>(`/parent/${parentId}/children`, {
      method: "GET",
    });

    // Map each child to add photoUrl if photo exists
    return (data || []).map((c) => {
      const photo = (c as any).photo;
      return {
        ...c,
        photo,
        photoUrl: photo ? (photo.startsWith("http") ? photo : `${API_BASE_URL}${photo}`) : undefined,
      } as Child;
    });
  }

  // Update a child
  // Accepts either UpdateChildRequest (JSON) or FormData (for image upload)
  async updateChild(
    parentId: string,
    childId: string,
    data: UpdateChildRequest | FormData
  ): Promise<{ message: string } | any> {
    const options: RequestInit = {
      method: "PUT",
      body: data as any,
    };
    const resp = await this.request<any>(`/parent/${parentId}/child/${childId}`, options);
    return resp;
  }

  // Delete a child
  async deleteChild(parentId: string, childId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/parent/${parentId}/child/${childId}`, {
      method: "DELETE",
    });
  }

  // Get all children (admin route)
  async getAllChildren(): Promise<{ children: Child[] }> {
    const resp = await this.request<{ children: Child[] }>("/children", {
      method: "GET",
    });
    // map children array to add photoUrl
    const mapped = {
      children: (resp?.children || []).map((c) => {
        const photo = (c as any).photo;
        return {
          ...c,
          photo,
          photoUrl: photo ? (photo.startsWith("http") ? photo : `${API_BASE_URL}${photo}`) : undefined,
        } as Child;
      }),
    };
    return mapped;
  }

  // Get a single child by ID
  async getChildById(childId: string): Promise<Child> {
    const c = await this.request<Child>(`/child/${childId}`, {
      method: "GET",
    });
    const photo = (c as any).photo;
    return {
      ...c,
      photo,
      photoUrl: photo ? (photo.startsWith("http") ? photo : `${API_BASE_URL}${photo}`) : undefined,
    } as Child;
  }
}

export const childrenApi = new ChildrenApi();
