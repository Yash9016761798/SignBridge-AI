import apiClient from './api';
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserQueryParams,
  AdminPaginatedResponse,
  AdminUserStats,
} from '@/types/admin';

export const adminUserApi = {
  async getUsers(params: AdminUserQueryParams = {}): Promise<AdminPaginatedResponse<AdminUser>> {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  async getUserById(id: string): Promise<AdminUserDetail> {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data;
  },

  async updateUser(
    id: string,
    data: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'email' | 'role' | 'status'>>,
  ): Promise<AdminUser> {
    const { data: result } = await apiClient.put(`/admin/users/${id}`, data);
    return result;
  },

  async suspendUser(id: string): Promise<AdminUser> {
    const { data } = await apiClient.patch(`/admin/users/${id}/suspend`);
    return data;
  },

  async activateUser(id: string): Promise<AdminUser> {
    const { data } = await apiClient.patch(`/admin/users/${id}/activate`);
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async getStats(): Promise<AdminUserStats> {
    const { data } = await apiClient.get('/admin/dashboard/stats');
    return {
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      suspendedUsers: 0,
      newUsersThisMonth: 0,
    };
  },
};
