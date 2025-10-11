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
  getAll: (): Promise<{ data: News[] }> => api.get('/news'),
  getById: (id: number): Promise<{ data: News }> => api.get(`/news/${id}`),
  create: (data: NewsRequest): Promise<{ data: News }> => api.post('/news', data),
  update: (id: number, data: NewsRequest): Promise<{ data: News }> => api.put(`/news/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/news/${id}`).then(() => {}),
};

// Shows API
export const showsApi = {
  getAll: (): Promise<{ data: Show[] }> => api.get('/shows'),
  getById: (id: number): Promise<{ data: Show }> => api.get(`/shows/${id}`),
  create: (data: ShowRequest): Promise<{ data: Show }> => api.post('/shows', data),
  update: (id: number, data: ShowRequest): Promise<{ data: Show }> => api.put(`/shows/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/shows/${id}`).then(() => {}),
};

// Clients API
export const clientsApi = {
  getAll: (): Promise<{ data: Client[] }> => api.get('/clients'),
  getById: (id: number): Promise<{ data: Client }> => api.get(`/clients/${id}`),
  create: (data: ClientRequest): Promise<{ data: Client }> => api.post('/clients', data),
  update: (id: number, data: ClientRequest): Promise<{ data: Client }> => api.put(`/clients/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/clients/${id}`).then(() => {}),
};

// Users API
export const usersApi = {
  getAll: (): Promise<{ data: User[] }> => api.get('/users'),
  getById: (id: number): Promise<{ data: User }> => api.get(`/users/${id}`),
  create: (data: UserRequest): Promise<{ data: User }> => api.post('/users', data),
  update: (id: number, data: Partial<UserRequest>): Promise<{ data: User }> => api.put(`/users/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/users/${id}`).then(() => {}),
};

// Subscribers API
export const subscribersApi = {
  getAll: (): Promise<{ data: Subscriber[] }> => api.get('/subscribers'),
  getById: (id: number): Promise<{ data: Subscriber }> => api.get(`/subscribers/${id}`),
  create: (data: SubscriberRequest): Promise<{ data: Subscriber }> => api.post('/subscribers', data),
  update: (id: number, data: SubscriberRequest): Promise<{ data: Subscriber }> => api.put(`/subscribers/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/subscribers/${id}`).then(() => {}),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: (): Promise<{ data: SubscriptionWithUser[] }> => api.get('/subscriptions'),
  getById: (id: number): Promise<{ data: Subscription }> => api.get(`/subscriptions/${id}`),
  create: (data: { user_id: number; subscribed: boolean }): Promise<{ data: Subscription }> => 
    api.post('/subscriptions', data),
  update: (id: number, data: { subscribed: boolean }): Promise<{ data: Subscription }> => 
    api.put(`/subscriptions/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/subscriptions/${id}`).then(() => {}),
};

// Mail Queue API
export const mailQueueApi = {
  getAll: (): Promise<{ data: MailQueue[] }> => api.get('/mail-queue'),
  getById: (id: number): Promise<{ data: MailQueue }> => api.get(`/mail-queue/${id}`),
  create: (data: MailQueueRequest): Promise<{ data: MailQueue }> => api.post('/mail-queue', data),
  update: (id: number, data: MailQueueRequest): Promise<{ data: MailQueue }> => api.put(`/mail-queue/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/mail-queue/${id}`).then(() => {}),
  sendEmail: (id: number): Promise<{ data: void }> => api.post(`/mail-queue/${id}/send`),
};

// Mail Log API
export const mailLogApi = {
  getAll: (): Promise<{ data: MailLogWithDetails[] }> => api.get('/mail-logs'),
  getStats: (): Promise<{ data: MailStats }> => api.get('/mail-logs/stats'),
};

// Upload API (R2 only)
export const uploadApi = {
  uploadToR2: (file: File, type: 'news' | 'shows' | 'clients' | 'mail'): Promise<{ data: { url: string; filename: string; key: string } }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFromR2: (key: string): Promise<{ data: { result: string; key: string } }> => {
    return api.delete(`/upload/delete?key=${key}`);
  },
};

// Fast API for dashboard data (3 second timeout)
export const fastApi = {
  shows: {
    getAll: (): Promise<{ data: Show[] }> => fastApiInstance.get('/shows'),
  },
  subscribers: {
    getAll: (): Promise<{ data: Subscriber[] }> => fastApiInstance.get('/subscribers'),
  },
  news: {
    getAll: (): Promise<{ data: News[] }> => fastApiInstance.get('/news'),
  },
  clients: {
    getAll: (): Promise<{ data: Client[] }> => fastApiInstance.get('/clients'),
  },
  subscriptions: {
    getAll: (): Promise<{ data: SubscriptionWithUser[] }> => fastApiInstance.get('/subscriptions'),
  },
  mailLogs: {
    getAll: (): Promise<{ data: MailLogWithDetails[] }> => fastApiInstance.get('/mail-logs'),
    getStats: (): Promise<{ data: MailStats }> => fastApiInstance.get('/mail-logs/stats'),
  },
};

// Videos API
export const videosApi = {
  getAll: (): Promise<{ data: Video[] }> => api.get('/videos'),
  getById: (id: number): Promise<{ data: Video }> => api.get(`/videos/${id}`),
  create: (data: VideoRequest): Promise<{ data: Video }> => api.post('/videos', data),
  update: (id: number, data: VideoRequest): Promise<{ data: Video }> => api.put(`/videos/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/videos/${id}`),
};

// Auth API
export const authApi = {
  login: (email: string, password: string): Promise<{ data: User }> => 
    api.post('/users/login', { email, password }),
  logout: (): Promise<ApiResponse<void>> => api.post('/users/logout'),
};

export default api;
