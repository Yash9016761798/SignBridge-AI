export type UserRole = 'LEARNER' | 'TEACHER' | 'HOSPITAL' | 'NGO' | 'GOVERNMENT' | 'ADMIN';

export type OrganizationType = 'SCHOOL' | 'COLLEGE' | 'NGO' | 'HOSPITAL' | 'GOVERNMENT' | 'COMPANY';

export type CourseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type TranslationType = 'TEXT_TO_SIGN' | 'SPEECH_TO_SIGN' | 'SIGN_TO_TEXT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  roleId: string;
  organizationId?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: CourseDifficulty;
  thumbnail?: string;
  estimatedDuration?: number;
  status: CourseStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
