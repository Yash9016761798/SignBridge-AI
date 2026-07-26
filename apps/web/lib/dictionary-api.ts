import apiClient from './api';
import type {
  SignWord,
  SignWordListItem,
  SignCategory,
  PaginatedResponse,
  SignWordQueryParams,
  AlphabetStats,
} from '@/types/dictionary';

export const dictionaryApi = {
  async getSignWords(params: SignWordQueryParams = {}): Promise<PaginatedResponse<SignWordListItem>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    return apiClient.get(`/dictionary/signs${qs ? `?${qs}` : ''}`);
  },

  async getSignWordById(id: string): Promise<SignWord> {
    return apiClient.get(`/dictionary/signs/${id}`);
  },

  async getCategories(): Promise<SignCategory[]> {
    return apiClient.get('/dictionary/categories');
  },

  async getCategoryById(id: string): Promise<SignCategory & { signs: SignWordListItem[] }> {
    return apiClient.get(`/dictionary/categories/${id}`);
  },

  async toggleFavorite(signId: string): Promise<{ favorited: boolean }> {
    return apiClient.post(`/dictionary/favorites/${signId}`);
  },

  async getAlphabetStats(): Promise<AlphabetStats> {
    return apiClient.get('/dictionary/alphabet-stats');
  },
};
