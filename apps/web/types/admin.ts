export type AdminUserRole = 'LEARNER' | 'INSTRUCTOR' | 'TEACHER' | 'HOSPITAL' | 'NGO' | 'GOVERNMENT' | 'ADMIN';
export type AdminUserStatus = 'active' | 'inactive' | 'suspended';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  profileImage: string | null;
  isVerified: boolean;
  organizationId: string | null;
  organizationName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUser {
  phone: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  practiceSessions: number;
  translations: number;
  recentActivity: AdminActivityItem[];
}

export interface AdminActivityItem {
  id: string;
  action: string;
  resource: string;
  details: string;
  createdAt: string;
}

export interface AdminUserQueryParams {
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  page?: number;
  limit?: number;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
}
