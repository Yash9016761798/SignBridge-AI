import apiClient from './api';
import type { AdminSettings } from '@/types/admin-settings';

export const adminSettingsApi = {
  async getSettings(): Promise<AdminSettings> {
    const { data } = await apiClient.get('/admin/settings');
    return data;
  },

  async saveSettings(
    section: string,
    data: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    const { data: result } = await apiClient.put('/admin/settings', { section, data });
    return result;
  },

  async uploadLogo(file: File): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await apiClient.post('/admin/settings/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async resetSettings(): Promise<{ success: boolean }> {
    const { data } = await apiClient.post('/admin/settings/reset');
    return data;
  },
};
