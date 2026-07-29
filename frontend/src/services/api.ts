import axios from 'axios';

/** Values that can be serialized into a query string. */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/** A JSON request body. Values stay `unknown` so callers keep their own types. */
export type Payload = Record<string, unknown>;

/** The error shape the API returns on failure. */
export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
  phoneStep?: boolean;
}

/**
 * Extracts a human-readable message from an unknown thrown value.
 * Lets call sites use `catch (err: unknown)` instead of `any` while still
 * surfacing the server's message.
 */
export const toErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    return err.response?.data?.message ?? err.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

/** Returns the API error body when the failure came from the server. */
export const toErrorBody = (err: unknown): ApiErrorBody | undefined =>
  axios.isAxiosError<ApiErrorBody>(err) ? err.response?.data : undefined;

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
  // Verification
  sendEmailOtp: (email: string) => API.post('/auth/send-email-otp', { email }),
  verifyEmail: (email: string, otp: string) => API.post('/auth/verify-email', { email, otp }),
  sendPhoneOtp: (email: string, phone?: string) => API.post('/auth/send-phone-otp', { email, phone }),
  verifyPhone: (email: string, otp: string) => API.post('/auth/verify-phone', { email, otp }),
  resendOtp: (email: string, type: 'email' | 'phone') => API.post('/auth/resend-otp', { email, type }),
  // Password reset
  forgotPassword: (email: string) => API.post('/auth/forgot-password', { email }),
  resetPassword: (email: string, otp: string, password: string) =>
    API.post('/auth/reset-password', { email, otp, password }),
};


// ── Lawyers ───────────────────────────────────────────────────────
export const lawyerAPI = {
  getAll: (params?: QueryParams) => API.get('/lawyers', { params }),
  getById: (id: string) => API.get(`/lawyers/${id}`),
  getMyProfile: () => API.get('/lawyers/me'),
  create: (data: Payload) => API.post('/lawyers', data),
  update: (id: string, data: Payload) => API.put(`/lawyers/${id}`, data),
};

// ── Cases ─────────────────────────────────────────────────────────
export const caseAPI = {
  getMyCases: (params?: QueryParams) => API.get('/cases', { params }),
  create: (data: Payload) => API.post('/cases', data),
  update: (id: string, data: Payload) => API.put(`/cases/${id}`, data),
  toggleVisibility: (id: string) => API.put(`/cases/${id}/visibility`, {}),
  delete: (id: string) => API.delete(`/cases/${id}`),
};

// ── Reviews ───────────────────────────────────────────────────────
export const reviewAPI = {
  getForLawyer: (lawyerId: string, params?: QueryParams) =>
    API.get(`/reviews/${lawyerId}`, { params }),
  create: (data: { lawyerId: string; rating: number; comment: string; isAnonymous?: boolean }) =>
    API.post('/reviews', data),
  delete: (id: string) => API.delete(`/reviews/${id}`),
};

// ── Meetings ──────────────────────────────────────────────────────
export const meetingAPI = {
  schedule: (data: Payload) => API.post('/meetings', data),
  getMyMeetings: () => API.get('/meetings/my'),
  getLawyerMeetings: () => API.get('/meetings/lawyer'),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    API.put(`/meetings/${id}/status`, data),
};

// ── Messages ──────────────────────────────────────────────────────
export const messageAPI = {
  send: (data: Payload) => API.post('/messages', data),
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
  getNews: (params?: QueryParams) => API.get('/news', { params }),
};

// ── Chatbot ───────────────────────────────────────────────────────
export const chatbotAPI = {
  sendMessage: (message: string) => API.post('/chatbot/message', { message }),
};

export default API;
