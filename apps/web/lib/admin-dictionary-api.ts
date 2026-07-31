import type {
  AdminDictSign,
  AdminDictCategory,
  AdminDictQueryParams,
  AdminDictPaginatedResponse,
  AdminDictStats,
  AdminDictAlphabetStats,
  AdminDictDifficulty,
  AdminDictStatus,
} from '@/types/admin-dictionary';

const CATEGORIES: AdminDictCategory[] = [
  { id: 'cat-1', name: 'Greetings', description: 'Common greeting signs', icon: 'wave-hand', signCount: 12, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'cat-2', name: 'Food & Drink', description: 'Signs related to food and beverages', icon: 'utensils', signCount: 18, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'cat-3', name: 'Emotions', description: 'Emotional expression signs', icon: 'heart', signCount: 15, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'cat-4', name: 'Numbers', description: 'Number signs', icon: 'hash', signCount: 20, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'cat-5', name: 'Family', description: 'Family relationship signs', icon: 'users', signCount: 14, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: 'cat-6', name: 'Travel', description: 'Travel and directions', icon: 'map-pin', signCount: 10, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
];

const SEED_SIGNS: AdminDictSign[] = [
  { id: 'sign-1', word: 'Hello', meaning: 'A greeting gesture', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-1', name: 'Greetings' }, isFavorited: false, favoriteCount: 45, tags: ['greeting'], status: 'ACTIVE', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 'sign-2', word: 'Thank You', meaning: 'Expressing gratitude', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-1', name: 'Greetings' }, isFavorited: false, favoriteCount: 38, tags: ['greeting', 'polite'], status: 'ACTIVE', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 'sign-3', word: 'Water', meaning: 'Requesting water', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-2', name: 'Food & Drink' }, isFavorited: false, favoriteCount: 22, tags: ['drink'], status: 'ACTIVE', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 'sign-4', word: 'Happy', meaning: 'Expressing happiness', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-3', name: 'Emotions' }, isFavorited: false, favoriteCount: 55, tags: ['emotion'], status: 'ACTIVE', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 'sign-5', word: 'One', meaning: 'Number 1', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-4', name: 'Numbers' }, isFavorited: false, favoriteCount: 30, tags: ['number'], status: 'ACTIVE', createdAt: '2025-02-10T00:00:00Z', updatedAt: '2025-02-10T00:00:00Z' },
  { id: 'sign-6', word: 'Mother', meaning: 'Mother / Mom', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-5', name: 'Family' }, isFavorited: false, favoriteCount: 42, tags: ['family'], status: 'ACTIVE', createdAt: '2025-02-10T00:00:00Z', updatedAt: '2025-02-10T00:00:00Z' },
  { id: 'sign-7', word: 'Airport', meaning: 'Location of airport', videoUrl: null, imageUrl: null, difficulty: 'INTERMEDIATE', category: { id: 'cat-6', name: 'Travel' }, isFavorited: false, favoriteCount: 12, tags: ['travel'], status: 'ACTIVE', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
  { id: 'sign-8', word: 'Sad', meaning: 'Expressing sadness', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-3', name: 'Emotions' }, isFavorited: false, favoriteCount: 28, tags: ['emotion'], status: 'ACTIVE', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
  { id: 'sign-9', word: 'Tea', meaning: 'Requesting tea', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-2', name: 'Food & Drink' }, isFavorited: false, favoriteCount: 19, tags: ['drink'], status: 'ACTIVE', createdAt: '2025-03-05T00:00:00Z', updatedAt: '2025-03-05T00:00:00Z' },
  { id: 'sign-10', word: 'Father', meaning: 'Father / Dad', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-5', name: 'Family' }, isFavorited: false, favoriteCount: 40, tags: ['family'], status: 'ACTIVE', createdAt: '2025-03-05T00:00:00Z', updatedAt: '2025-03-05T00:00:00Z' },
  { id: 'sign-11', word: 'Angry', meaning: 'Expressing anger', videoUrl: null, imageUrl: null, difficulty: 'INTERMEDIATE', category: { id: 'cat-3', name: 'Emotions' }, isFavorited: false, favoriteCount: 18, tags: ['emotion'], status: 'ACTIVE', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2025-03-10T00:00:00Z' },
  { id: 'sign-12', word: 'Two', meaning: 'Number 2', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-4', name: 'Numbers' }, isFavorited: false, favoriteCount: 25, tags: ['number'], status: 'ACTIVE', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2025-03-10T00:00:00Z' },
  { id: 'sign-13', word: 'Bread', meaning: 'Bread food item', videoUrl: null, imageUrl: null, difficulty: 'BEGINNER', category: { id: 'cat-2', name: 'Food & Drink' }, isFavorited: false, favoriteCount: 15, tags: ['food'], status: 'ACTIVE', createdAt: '2025-03-15T00:00:00Z', updatedAt: '2025-03-15T00:00:00Z' },
  { id: 'sign-14', word: 'Brother', meaning: 'Brother relationship', videoUrl: null, imageUrl: null, difficulty: 'INTERMEDIATE', category: { id: 'cat-5', name: 'Family' }, isFavorited: false, favoriteCount: 33, tags: ['family'], status: 'ACTIVE', createdAt: '2025-03-15T00:00:00Z', updatedAt: '2025-03-15T00:00:00Z' },
  { id: 'sign-15', word: 'Hotel', meaning: 'Hotel accommodation', videoUrl: null, imageUrl: null, difficulty: 'INTERMEDIATE', category: { id: 'cat-6', name: 'Travel' }, isFavorited: false, favoriteCount: 8, tags: ['travel'], status: 'ARCHIVED', createdAt: '2025-03-20T00:00:00Z', updatedAt: '2025-03-20T00:00:00Z' },
];

let signs = [...SEED_SIGNS];
let categories = [...CATEGORIES];
let nextSignId = 16;
let nextCatId = 7;

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export const adminDictApi = {
  async getSigns(params: AdminDictQueryParams = {}): Promise<AdminDictPaginatedResponse<AdminDictSign>> {
    await delay(300);
    let filtered = [...signs];
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((s) => s.word.toLowerCase().includes(q) || s.meaning.toLowerCase().includes(q));
    }
    if (params.categoryId) filtered = filtered.filter((s) => s.category.id === params.categoryId);
    if (params.difficulty) filtered = filtered.filter((s) => s.difficulty === params.difficulty);
    if (params.letter) filtered = filtered.filter((s) => s.word.toUpperCase().startsWith(params.letter!.toUpperCase()));
    if (params.status) filtered = filtered.filter((s) => s.status === params.status);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return { data, pagination: { page, limit, total, totalPages } };
  },

  async getSignById(id: string): Promise<AdminDictSign> {
    await delay(200);
    const sign = signs.find((s) => s.id === id);
    if (!sign) throw new Error('Sign not found');
    return { ...sign };
  },

  async createSign(input: { word: string; meaning: string; categoryId: string; difficulty: AdminDictDifficulty; videoUrl?: string; imageUrl?: string; tags?: string[] }): Promise<AdminDictSign> {
    await delay(400);
    const cat = categories.find((c) => c.id === input.categoryId);
    if (!cat) throw new Error('Category not found');
    const newSign: AdminDictSign = {
      id: `sign-${nextSignId++}`,
      word: input.word,
      meaning: input.meaning,
      videoUrl: input.videoUrl || null,
      imageUrl: input.imageUrl || null,
      difficulty: input.difficulty,
      category: { id: cat.id, name: cat.name },
      isFavorited: false,
      favoriteCount: 0,
      tags: input.tags || [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    signs = [newSign, ...signs];
    cat.signCount++;
    return newSign;
  },

  async updateSign(id: string, input: Partial<{ word: string; meaning: string; categoryId: string; difficulty: AdminDictDifficulty; videoUrl: string; imageUrl: string; tags: string[]; status: AdminDictStatus }>): Promise<AdminDictSign> {
    await delay(400);
    const idx = signs.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Sign not found');
    if (input.categoryId) {
      const cat = categories.find((c) => c.id === input.categoryId);
      if (!cat) throw new Error('Category not found');
      signs[idx].category = { id: cat.id, name: cat.name };
    }
    if (input.word !== undefined) signs[idx].word = input.word;
    if (input.meaning !== undefined) signs[idx].meaning = input.meaning;
    if (input.difficulty !== undefined) signs[idx].difficulty = input.difficulty;
    if (input.videoUrl !== undefined) signs[idx].videoUrl = input.videoUrl;
    if (input.imageUrl !== undefined) signs[idx].imageUrl = input.imageUrl;
    if (input.tags !== undefined) signs[idx].tags = input.tags;
    if (input.status !== undefined) signs[idx].status = input.status;
    signs[idx].updatedAt = new Date().toISOString();
    return { ...signs[idx] };
  },

  async deleteSign(id: string): Promise<void> {
    await delay(300);
    const idx = signs.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Sign not found');
    const cat = categories.find((c) => c.id === signs[idx].category.id);
    if (cat) cat.signCount--;
    signs.splice(idx, 1);
  },

  async archiveSign(id: string): Promise<AdminDictSign> {
    return this.updateSign(id, { status: 'ARCHIVED' });
  },

  async duplicateSign(id: string): Promise<AdminDictSign> {
    await delay(300);
    const original = signs.find((s) => s.id === id);
    if (!original) throw new Error('Sign not found');
    const dup: AdminDictSign = {
      ...original,
      id: `sign-${nextSignId++}`,
      word: `${original.word} (Copy)`,
      isFavorited: false,
      favoriteCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    signs = [dup, ...signs];
    const cat = categories.find((c) => c.id === original.category.id);
    if (cat) cat.signCount++;
    return dup;
  },

  async getCategories(): Promise<AdminDictCategory[]> {
    await delay(200);
    return [...categories];
  },

  async createCategory(input: { name: string; description?: string; icon?: string }): Promise<AdminDictCategory> {
    await delay(300);
    if (categories.some((c) => c.name.toLowerCase() === input.name.toLowerCase())) {
      throw new Error('Category with this name already exists');
    }
    const cat: AdminDictCategory = {
      id: `cat-${nextCatId++}`,
      name: input.name,
      description: input.description || null,
      icon: input.icon || null,
      signCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories = [...categories, cat];
    return cat;
  },

  async updateCategory(id: string, input: Partial<{ name: string; description: string; icon: string }>): Promise<AdminDictCategory> {
    await delay(300);
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    if (input.name) categories[idx].name = input.name;
    if (input.description !== undefined) categories[idx].description = input.description;
    if (input.icon !== undefined) categories[idx].icon = input.icon;
    categories[idx].updatedAt = new Date().toISOString();
    return { ...categories[idx] };
  },

  async deleteCategory(id: string): Promise<void> {
    await delay(300);
    const cat = categories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    if (cat.signCount > 0) throw new Error('Cannot delete category with associated signs');
    categories = categories.filter((c) => c.id !== id);
  },

  async getStats(): Promise<AdminDictStats> {
    await delay(200);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      totalSigns: signs.length,
      totalCategories: categories.length,
      totalFavorites: signs.reduce((sum, s) => sum + s.favoriteCount, 0),
      recentlyAdded: signs.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo).length,
      beginnerCount: signs.filter((s) => s.difficulty === 'BEGINNER').length,
      intermediateCount: signs.filter((s) => s.difficulty === 'INTERMEDIATE').length,
      advancedCount: signs.filter((s) => s.difficulty === 'ADVANCED').length,
    };
  },

  async getAlphabetStats(): Promise<AdminDictAlphabetStats> {
    await delay(200);
    const stats: AdminDictAlphabetStats = {};
    signs.forEach((s) => {
      const letter = s.word[0]?.toUpperCase();
      if (letter) stats[letter] = (stats[letter] || 0) + 1;
    });
    return stats;
  },
};
