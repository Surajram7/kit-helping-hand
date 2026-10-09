const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('kit_auth_token');
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type if body is FormData
  if (!(options.body instanceof FormData)) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // response wasn't JSON
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  // If response is 204 or empty
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) => request<any>('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),

  // Academic
  getHierarchy: () => request<any>('/academic/hierarchy'),
  getPrograms: (all = false) => request<any[]>(`/academic/programs?all=${all}`),
  createProgram: (data: any) => request<any>('/academic/programs', { method: 'POST', body: JSON.stringify(data) }),
  updateProgram: (id: string, data: any) => request<any>(`/academic/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgram: (id: string) => request<any>(`/academic/programs/${id}`, { method: 'DELETE' }),

  getBatches: (programId?: string, all = false) =>
    request<any[]>(`/academic/batches?all=${all}${programId ? `&programId=${programId}` : ''}`),
  createBatch: (data: any) => request<any>('/academic/batches', { method: 'POST', body: JSON.stringify(data) }),
  updateBatch: (id: string, data: any) => request<any>(`/academic/batches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBatch: (id: string) => request<any>(`/academic/batches/${id}`, { method: 'DELETE' }),

  getSemesters: (all = false) => request<any[]>(`/academic/semesters?all=${all}`),
  createSemester: (data: any) => request<any>('/academic/semesters', { method: 'POST', body: JSON.stringify(data) }),
  updateSemester: (id: string, data: any) => request<any>(`/academic/semesters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSemester: (id: string) => request<any>(`/academic/semesters/${id}`, { method: 'DELETE' }),

  getAffiliations: (all = false) => request<any[]>(`/academic/affiliations?all=${all}`),
  createAffiliation: (data: any) => request<any>('/academic/affiliations', { method: 'POST', body: JSON.stringify(data) }),
  updateAffiliation: (id: string, data: any) => request<any>(`/academic/affiliations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAffiliation: (id: string) => request<any>(`/academic/affiliations/${id}`, { method: 'DELETE' }),

  getSubjects: (params?: { programId?: string; semesterId?: string; all?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.programId) q.append('programId', params.programId);
    if (params?.semesterId) q.append('semesterId', params.semesterId);
    if (params?.all) q.append('all', 'true');
    return request<any[]>(`/academic/subjects?${q.toString()}`);
  },
  createSubject: (data: any) => request<any>('/academic/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: string, data: any) => request<any>(`/academic/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id: string) => request<any>(`/academic/subjects/${id}`, { method: 'DELETE' }),

  // Resources
  getResources: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        q.append(key, String(val));
      }
    });
    return request<any>(`/resources?${q.toString()}`);
  },
  getResourceById: (id: string) => request<any>(`/resources/${id}`),
  uploadResource: (formData: FormData) => request<any>('/resources', { method: 'POST', body: formData }),
  updateResource: (id: string, data: any) => request<any>(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResource: (id: string) => request<any>(`/resources/${id}`, { method: 'DELETE' }),
  getFileViewUrl: (fileId: string) => `${API_BASE}/resources/files/${fileId}/view`,
  getFileDownloadUrl: (fileId: string) => `${API_BASE}/resources/files/${fileId}/download`,

  // Past Papers
  getPastPapers: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        q.append(key, String(val));
      }
    });
    return request<any>(`/past-papers?${q.toString()}`);
  },

  // Student Requests
  createRequest: (data: any) => request<any>('/requests', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: () => request<any[]>('/requests/my'),
  getAllRequests: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        q.append(key, String(val));
      }
    });
    return request<any>(`/requests?${q.toString()}`);
  },
  updateRequestStatus: (id: string, data: any) => request<any>(`/requests/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  addRequestComment: (id: string, comment: string) =>
    request<any>(`/requests/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getUsers: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        q.append(key, String(val));
      }
    });
    return request<any>(`/admin/users?${q.toString()}`);
  },
  updateUserRole: (id: string, role: string) =>
    request<any>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  updateUserStatus: (id: string, isActive: boolean) =>
    request<any>(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
  getAuditLogs: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        q.append(key, String(val));
      }
    });
    return request<any>(`/admin/audit-logs?${q.toString()}`);
  },

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
