import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string; phone?: string }) =>
    API.post('/auth/register', data),
  login: (data: { email: string; password: string }) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return API.put('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};


// ── Lawyers ───────────────────────────────────────────────────────
export const lawyerAPI = {
  getAll: (params?: Record<string, any>) => API.get('/lawyers', { params }),
  getById: (id: string) => API.get(`/lawyers/${id}`),
  getMyProfile: () => API.get('/lawyers/me'),
  create: (data: Record<string, any>) => API.post('/lawyers', data),
  update: (id: string, data: Record<string, any>) => API.put(`/lawyers/${id}`, data),
};

// ── Cases ─────────────────────────────────────────────────────────
export const caseAPI = {
  getMyCases: (params?: Record<string, any>) => API.get('/cases', { params }),
  create: (data: Record<string, any>) => API.post('/cases', data),
  update: (id: string, data: Record<string, any>) => API.put(`/cases/${id}`, data),
  toggleVisibility: (id: string) => API.put(`/cases/${id}/visibility`, {}),
  delete: (id: string) => API.delete(`/cases/${id}`),
};

// ── Reviews ───────────────────────────────────────────────────────
export const reviewAPI = {
  getForLawyer: (lawyerId: string, params?: Record<string, any>) =>
    API.get(`/reviews/${lawyerId}`, { params }),
  create: (data: { lawyerId: string; rating: number; comment: string; isAnonymous?: boolean }) =>
    API.post('/reviews', data),
  delete: (id: string) => API.delete(`/reviews/${id}`),
};

// ── Meetings ──────────────────────────────────────────────────────
export const meetingAPI = {
  schedule: (data: Record<string, any>) => API.post('/meetings', data),
  getMyMeetings: () => API.get('/meetings/my'),
  getLawyerMeetings: () => API.get('/meetings/lawyer'),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    API.put(`/meetings/${id}/status`, data),
};

// ── Messages ──────────────────────────────────────────────────────
export const messageAPI = {
  send: (data: Record<string, any>) => API.post('/messages', data),
  getInbox: () => API.get('/messages/inbox'),
  markRead: (id: string) => API.put(`/messages/${id}/read`, {}),
};

// ── Chat Rooms ────────────────────────────────────────────────────
export const chatAPI = {
  getRooms: () => API.get('/chat/rooms'),
  getHistory: (lawyerId: string) => API.get(`/chat/${lawyerId}/history`),
};

// ── News ──────────────────────────────────────────────────────────
export const newsAPI = {
  getNews: (params?: Record<string, any>) => API.get('/news', { params }),
};

// ── Chatbot ───────────────────────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (message: string) => API.post('/chatbot/message', { message }),
};

export default API;
