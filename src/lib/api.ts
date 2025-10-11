import axios from 'axios';
import { 
  News, NewsRequest, 
  Show, ShowRequest, 
  Client, ClientRequest, 
  Video, VideoRequest,
  User, UserRequest, 
  Subscriber, SubscriberRequest,
  Subscription, SubscriptionWithUser,
  MailQueue, MailQueueRequest,
  MailLogWithDetails,
  MailStats,
  ApiResponse,
  PaginatedResponse
} from '@/types';

import { CLIENT_API_CONFIG } from './client-api';

// Use proxy to hide the actual API URL
const API_BASE_URL = CLIENT_API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fast API instance for dashboard data
const fastApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000, // 3 seconds for faster loading
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fast API interceptors
fastApiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// News API
export const newsApi = {
  getAll: (): Promise<{ data: News[] }> => api.get('/api/news'),
  getById: (id: number): Promise<{ data: News }> => api.get(`/api/news/${id}`),
  create: (data: NewsRequest): Promise<{ data: News }> => api.post('/api/news', data),
  update: (id: number, data: NewsRequest): Promise<{ data: News }> => api.put(`/api/news/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/news/${id}`).then(() => {}),
};

// Shows API
export const showsApi = {
  getAll: (): Promise<{ data: Show[] }> => api.get('/api/shows'),
  getById: (id: number): Promise<{ data: Show }> => api.get(`/api/shows/${id}`),
  create: (data: ShowRequest): Promise<{ data: Show }> => api.post('/api/shows', data),
  update: (id: number, data: ShowRequest): Promise<{ data: Show }> => api.put(`/api/shows/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/shows/${id}`).then(() => {}),
};

// Clients API
export const clientsApi = {
  getAll: (): Promise<{ data: Client[] }> => api.get('/api/clients'),
  getById: (id: number): Promise<{ data: Client }> => api.get(`/api/clients/${id}`),
  create: (data: ClientRequest): Promise<{ data: Client }> => api.post('/api/clients', data),
  update: (id: number, data: ClientRequest): Promise<{ data: Client }> => api.put(`/api/clients/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/clients/${id}`).then(() => {}),
};

// Users API
export const usersApi = {
  getAll: (): Promise<{ data: User[] }> => api.get('/api/users'),
  getById: (id: number): Promise<{ data: User }> => api.get(`/api/users/${id}`),
  create: (data: UserRequest): Promise<{ data: User }> => api.post('/api/users', data),
  update: (id: number, data: Partial<UserRequest>): Promise<{ data: User }> => api.put(`/api/users/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/users/${id}`).then(() => {}),
};

// Subscribers API
export const subscribersApi = {
  getAll: (): Promise<{ data: Subscriber[] }> => api.get('/api/subscribers'),
  getById: (id: number): Promise<{ data: Subscriber }> => api.get(`/api/subscribers/${id}`),
  create: (data: SubscriberRequest): Promise<{ data: Subscriber }> => api.post('/api/subscribers', data),
  update: (id: number, data: SubscriberRequest): Promise<{ data: Subscriber }> => api.put(`/api/subscribers/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/subscribers/${id}`).then(() => {}),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: (): Promise<{ data: SubscriptionWithUser[] }> => api.get('/api/subscriptions'),
  getById: (id: number): Promise<{ data: Subscription }> => api.get(`/api/subscriptions/${id}`),
  create: (data: { user_id: number; subscribed: boolean }): Promise<{ data: Subscription }> => 
    api.post('/api/subscriptions', data),
  update: (id: number, data: { subscribed: boolean }): Promise<{ data: Subscription }> => 
    api.put(`/api/subscriptions/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/subscriptions/${id}`).then(() => {}),
};

// Mail Queue API
export const mailQueueApi = {
  getAll: (): Promise<{ data: MailQueue[] }> => api.get('/api/mail-queue'),
  getById: (id: number): Promise<{ data: MailQueue }> => api.get(`/api/mail-queue/${id}`),
  create: (data: MailQueueRequest): Promise<{ data: MailQueue }> => api.post('/api/mail-queue', data),
  update: (id: number, data: MailQueueRequest): Promise<{ data: MailQueue }> => api.put(`/api/mail-queue/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/mail-queue/${id}`).then(() => {}),
  sendEmail: (id: number): Promise<{ data: void }> => api.post(`/api/mail-queue/${id}/send`),
};

// Mail Log API
export const mailLogApi = {
  getAll: (): Promise<{ data: MailLogWithDetails[] }> => api.get('/api/mail-logs'),
  getStats: (): Promise<{ data: MailStats }> => api.get('/api/mail-logs/stats'),
};

// Upload API (R2 only)
export const uploadApi = {
  uploadToR2: (file: File, type: 'news' | 'shows' | 'clients' | 'mail'): Promise<{ data: { url: string; filename: string; key: string } }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/api/upload/r2', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFromR2: (key: string): Promise<{ data: { result: string; key: string } }> => {
    return api.delete(`/api/upload/r2/delete?key=${key}`);
  },
};

// Fast API for dashboard data (3 second timeout)
export const fastApi = {
  shows: {
    getAll: (): Promise<{ data: Show[] }> => fastApiInstance.get('/api/shows'),
  },
  subscribers: {
    getAll: (): Promise<{ data: Subscriber[] }> => fastApiInstance.get('/api/subscribers'),
  },
  news: {
    getAll: (): Promise<{ data: News[] }> => fastApiInstance.get('/api/news'),
  },
  clients: {
    getAll: (): Promise<{ data: Client[] }> => fastApiInstance.get('/api/clients'),
  },
  subscriptions: {
    getAll: (): Promise<{ data: SubscriptionWithUser[] }> => fastApiInstance.get('/api/subscriptions'),
  },
  mailLogs: {
    getAll: (): Promise<{ data: MailLogWithDetails[] }> => fastApiInstance.get('/api/mail-logs'),
    getStats: (): Promise<{ data: MailStats }> => fastApiInstance.get('/api/mail-logs/stats'),
  },
};

// Videos API
export const videosApi = {
  getAll: (): Promise<{ data: Video[] }> => api.get('/api/videos'),
  getById: (id: number): Promise<{ data: Video }> => api.get(`/api/videos/${id}`),
  create: (data: VideoRequest): Promise<{ data: Video }> => api.post('/api/videos', data),
  update: (id: number, data: VideoRequest): Promise<{ data: Video }> => api.put(`/api/videos/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/api/videos/${id}`),
};

// Auth API
export const authApi = {
  login: (email: string, password: string): Promise<{ data: User }> => 
    api.post('/users/login', { email, password }),
  logout: (): Promise<ApiResponse<void>> => api.post('/users/logout'),
};

export default api;
