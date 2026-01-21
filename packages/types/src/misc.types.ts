export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  userId: string | null;
  createdAt: Date;
}

export interface CreateNotificationDto {
  type: string;
  message: string;
  userId?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  userEmail: string;
  userId: string | null;
  user?: {
    name: string | null;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupportTicketDto {
  subject: string;
  message: string;
  userEmail: string;
}

export interface UpdateSupportTicketDto {
  status?: string;
  message?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: number;
  lowStockProducts: number;
}

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
}

export interface ContactFormDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}
