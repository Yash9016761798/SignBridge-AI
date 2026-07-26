export type SignDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface SignCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  signCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SignWord {
  id: string;
  word: string;
  meaning: string;
  videoUrl: string | null;
  imageUrl: string | null;
  difficulty: SignDifficulty;
  categoryId: string;
  category: SignCategory;
  isFavorited: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SignWordListItem {
  id: string;
  word: string;
  meaning: string;
  videoUrl: string | null;
  imageUrl: string | null;
  difficulty: SignDifficulty;
  category: Pick<SignCategory, 'id' | 'name'>;
  isFavorited: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SignWordQueryParams {
  search?: string;
  categoryId?: string;
  difficulty?: SignDifficulty;
  letter?: string;
  page?: number;
  limit?: number;
  sortBy?: 'word' | 'createdAt' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

export interface AlphabetStats {
  [letter: string]: number;
}
