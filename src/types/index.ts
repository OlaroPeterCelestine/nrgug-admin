// Database entity types based on the API schema

export interface News {
  id: number;
  image?: string;
  title: string;
  story: string;
  author: string;
  category: string;
  timestamp: string;
}

export interface NewsRequest {
  image?: string;
  title: string;
  story: string;
  author: string;
  category: string;
}

export interface Show {
  id: number;
  image?: string;
  hosts: string;
  time_from: string;
  time_to: string;
  created_at: string;
}

export interface ShowRequest {
  image?: string;
  hosts: string;
  time_from: string;
  time_to: string;
}

export interface Client {
  id: number;
  name: string;
  image?: string;
  link?: string;
}

export interface ClientRequest {
  name: string;
  image?: string;
  link?: string;
}

export interface Video {
  id: number;
  title: string;
  video_url: string;
  created_at: string;
}

export interface VideoRequest {
  title: string;
  video_url: string;
}

export interface User {
  id: number;
  name: string;
  phone?: string;
  role: string;
  email: string;
  created_at: string;
}

export interface UserRequest {
  name: string;
  phone?: string;
  role: string;
  email: string;
  password: string;
}

export interface Subscriber {
  id: number;
  email: string;
  name?: string;
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriberRequest {
  email: string;
  name?: string;
  subscribed: boolean;
}

export interface Subscription {
  id: number;
  user_id: number;
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithUser extends Subscription {
  user_name: string;
  user_email: string;
}

export interface MailQueue {
  id: number;
  subject: string;
  body: string;
  image?: string;
  sent: boolean;
  created_at: string;
  sent_at?: string;
}

export interface MailQueueRequest {
  subject: string;
  body: string;
  image?: string;
}

export interface MailLog {
  id: number;
  subscriber_id: number;
  mail_id: number;
  sent_at: string;
}

export interface MailLogWithDetails extends MailLog {
  subscriber_email: string;
  subscriber_name?: string;
  mail_subject: string;
}

export interface MailStats {
  total_emails: number;
  sent_emails: number;
  pending_emails: number;
  total_subscribers: number;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
