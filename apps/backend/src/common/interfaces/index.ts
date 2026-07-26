export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T = unknown> {
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

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    firebaseUid: string;
    roleId: string;
    role?: string;
    organizationId?: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SortingQuery {
  sort?: string;
  order?: 'asc' | 'desc';
}
