const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        return { error: error.message || `Erro ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Erro de conexão' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile(file: File, analysisTypeId: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysisTypeId', analysisTypeId);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        return { error: error.message || `Erro ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Erro de conexão' };
    }
  }
}

export const api = new ApiClient();

export const authApi = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  register: async (email: string, password: string, fullName: string, role?: 'admin' | 'user') => {
    return api.post('/auth/register', { email, password, fullName, role });
  },
  getProfile: async () => {
    return api.get('/auth/profile');
  },
};

export const usersApi = {
  getAll: async () => {
    return api.get('/users');
  },
  getOne: async (id: string) => {
    return api.get(`/users/${id}`);
  },
  create: async (data: { email: string; password: string; fullName: string; role?: 'admin' | 'user' }) => {
    return api.post('/users', data);
  },
  update: async (id: string, data: { fullName?: string; role?: 'admin' | 'user' }) => {
    return api.put(`/users/${id}`, data);
  },
  delete: async (id: string) => {
    return api.delete(`/users/${id}`);
  },
  resetPassword: async (id: string, password: string) => {
    return api.put(`/users/${id}/reset-password`, { password });
  },
};

export const analysisTypesApi = {
  getAll: async (onlyActive?: boolean) => {
    const query = onlyActive ? '?onlyActive=true' : '';
    return api.get(`/analysis-types${query}`);
  },
  getOne: async (id: string) => {
    return api.get(`/analysis-types/${id}`);
  },
  create: async (data: {
    name: string;
    description: string;
    aiModel: string;
    template: string;
    isActive?: boolean;
  }) => {
    return api.post('/analysis-types', data);
  },
  update: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      aiModel?: string;
      template?: string;
      isActive?: boolean;
    },
  ) => {
    return api.put(`/analysis-types/${id}`, data);
  },
  delete: async (id: string) => {
    return api.delete(`/analysis-types/${id}`);
  },
};

export const documentsApi = {
  getAll: async () => {
    return api.get('/documents');
  },
  getOne: async (id: string) => {
    return api.get(`/documents/${id}`);
  },
  upload: async (file: File, analysisTypeId: string) => {
    return api.uploadFile(file, analysisTypeId);
  },
  createForChat: async (data: {
    fileName: string;
    fileUrl: string;
    analysisTypeId: string;
  }) => {
    return api.post('/documents/create-chat', data);
  },
  sendToN8n: async (documentId: string, data: any) => {
    return api.post(`/documents/${documentId}/send-n8n`, data);
  },
};

export const tokenUsageApi = {
  getStats: async (dateRange?: '7d' | '30d' | '90d' | 'all') => {
    const query = dateRange ? `?dateRange=${dateRange}` : '';
    return api.get(`/token-usage/stats${query}`);
  },
};
