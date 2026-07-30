import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSignWordDto } from './dto/create-sign-word.dto';
import { UpdateSignWordDto } from './dto/update-sign-word.dto';
import { QuerySignWordDto } from './dto/query-sign-word.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllSignWords(query: QuerySignWordDto) {
    this.logger.log('Incoming Query');
    this.logger.log(query);

    const {
      search,
      categoryId,
      difficulty,
      letter,
      page = 1,
      limit = 20,
      sortBy = 'word',
      sortOrder = 'asc',
      userId,
    } = query;

    this.logger.log(search, categoryId, difficulty, letter);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;
    if (letter) where.word = { startsWith: letter, mode: 'insensitive' };
    if (userId) where.favorites = { some: { userId } };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.signWord.findMany({
        where,
        include: {
          category: true,
          favorites: userId ? { where: { userId }, select: { id: true } } : false,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.signWord.count({ where }),
    ]);

    const itemsWithFavorite = items.map((item) => ({
      ...item,
      isFavorited: Array.isArray(item.favorites) ? item.favorites.length > 0 : false,
      favorites: undefined,
    }));

    return {
      data: itemsWithFavorite,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findSignWordById(id: string, userId?: string) {
    const signWord = await this.prisma.signWord.findUnique({
      where: { id },
      include: {
        category: true,
        favorites: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });
    if (!signWord) throw new NotFoundException('Sign word not found');

    const isFavorited = Array.isArray(signWord.favorites) ? signWord.favorites.length > 0 : false;
    return { ...signWord, isFavorited, favorites: undefined };
  }

  async createSignWord(dto: CreateSignWordDto) {
    const category = await this.prisma.signCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const signWord = await this.prisma.signWord.create({
      data: {
        word: dto.word,
        meaning: dto.meaning,
        categoryId: dto.categoryId,
        videoUrl: dto.videoUrl,
        imageUrl: dto.imageUrl,
        difficulty: dto.difficulty || 'BEGINNER',
      },
      include: { category: true },
    });
    this.logger.log(`Created sign word: ${signWord.word}`);
    return signWord;
  }

  async updateSignWord(id: string, dto: UpdateSignWordDto) {
    const existing = await this.prisma.signWord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sign word not found');

    if (dto.categoryId) {
      const category = await this.prisma.signCategory.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
    }

    const signWord = await this.prisma.signWord.update({
      where: { id },
      data: {
        word: dto.word,
        meaning: dto.meaning,
        categoryId: dto.categoryId,
        videoUrl: dto.videoUrl,
        imageUrl: dto.imageUrl,
        difficulty: dto.difficulty,
      },
      include: { category: true },
    });
    this.logger.log(`Updated sign word: ${signWord.word}`);
    return signWord;
  }

  async deleteSignWord(id: string) {
    const existing = await this.prisma.signWord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sign word not found');
    await this.prisma.signWord.delete({ where: { id } });
    this.logger.log(`Deleted sign word: ${id}`);
  }

  async findAllCategories() {
    const categories = await this.prisma.signCategory.findMany({
      include: { _count: { select: { signs: true } } },
      orderBy: { name: 'asc' },
    });
    return categories.map((cat) => ({ ...cat, signCount: cat._count.signs, _count: undefined }));
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.signCategory.findUnique({
      where: { id },
      include: {
        signs: { take: 20, orderBy: { word: 'asc' } },
        _count: { select: { signs: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return { ...category, signCount: category._count.signs, _count: undefined };
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.signCategory.findFirst({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Category with this name already exists');

    const category = await this.prisma.signCategory.create({
      data: { name: dto.name, description: dto.description, icon: dto.icon },
    });
    this.logger.log(`Created category: ${category.name}`);
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.signCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.signCategory.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (duplicate) throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.signCategory.update({
      where: { id },
      data: { name: dto.name, description: dto.description, icon: dto.icon },
    });
    this.logger.log(`Updated category: ${category.name}`);
    return category;
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.signCategory.findUnique({
      where: { id },
      include: { _count: { select: { signs: true } } },
    });
    if (!existing) throw new NotFoundException('Category not found');
    if (existing._count.signs > 0)
      throw new ConflictException('Cannot delete category with associated signs');
    await this.prisma.signCategory.delete({ where: { id } });
    this.logger.log(`Deleted category: ${id}`);
  }

  async toggleFavorite(userId: string, signId: string) {
    this.logger.log('===== FAVORITE DEBUG =====');
    this.logger.log(`User ID: ${userId}`);
    this.logger.log(`Sign ID: ${signId}`);
    const signWord = await this.prisma.signWord.findUnique({ where: { id: signId } });
    this.logger.log(`Sign Found: ${JSON.stringify(signWord)}`);
    if (!signWord) throw new NotFoundException('Sign word not found');

    const existing = await this.prisma.favoriteSign.findUnique({
      where: { userId_signId: { userId, signId } },
    });

    if (existing) {
      await this.prisma.favoriteSign.delete({ where: { id: existing.id } });
      this.logger.log(`Removed favorite: ${signId} for user ${userId}`);
      return { favorited: false };
    } else {
      await this.prisma.favoriteSign.create({ data: { userId, signId } });
      this.logger.log(`Added favorite: ${signId} for user ${userId}`);
      return { favorited: true };
    }
  }

  async getAlphabetStats() {
    const result = await this.prisma.signWord.groupBy({ by: ['word'], _count: true });
    const alphabet: Record<string, number> = {};
    for (const item of result) {
      const letter = item.word.charAt(0).toUpperCase();
      alphabet[letter] = (alphabet[letter] || 0) + item._count;
    }
    return alphabet;
  }
}
