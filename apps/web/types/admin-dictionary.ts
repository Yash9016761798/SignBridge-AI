export type AdminDictDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AdminDictStatus = 'ACTIVE' | 'ARCHIVED';

export interface AdminDictSign {
  id: string;
  word: string;
  meaning: string;
  videoUrl: string | null;
  imageUrl: string | null;
  difficulty: AdminDictDifficulty;
  category: { id: string; name: string };
  isFavorited: boolean;
  favoriteCount: number;
  tags: string[];
  status: AdminDictStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDictCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  signCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDictQueryParams {
  search?: string;
  categoryId?: string;
  difficulty?: AdminDictDifficulty;
  letter?: string;
  status?: AdminDictStatus;
  page?: number;
  limit?: number;
  sortBy?: 'word' | 'createdAt' | 'difficulty' | 'favoriteCount';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminDictPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminDictStats {
  totalSigns: number;
  totalCategories: number;
  totalFavorites: number;
  recentlyAdded: number;
  beginnerCount: number;
  intermediateCount: number;
  advancedCount: number;
}

export interface AdminDictAlphabetStats {
  [letter: string]: number;
}
