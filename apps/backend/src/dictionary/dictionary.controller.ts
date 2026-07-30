import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';
import { CreateSignWordDto } from './dto/create-sign-word.dto';
import { UpdateSignWordDto } from './dto/update-sign-word.dto';
import { QuerySignWordDto } from './dto/query-sign-word.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  // ===========================================================================
  // SIGN WORDS
  // ===========================================================================

  @Get('signs')
  @ApiOperation({ summary: 'Get all sign words with search, filters, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of sign words' })
  async findAllSignWords(@Query() query: QuerySignWordDto) {
    return this.dictionaryService.findAllSignWords(query);
  }
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Optional user ID to determine favorite status',
  })
  @Get('signs/:id')
  @ApiOperation({ summary: 'Get sign word by ID' })
  @ApiResponse({ status: 200, description: 'Sign word details' })
  @ApiResponse({ status: 404, description: 'Sign word not found' })
  async findSignWordById(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.dictionaryService.findSignWordById(id, userId);
  }

  @Post('signs')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create a new sign word (Admin only)' })
  @ApiResponse({ status: 201, description: 'Sign word created' })
  async createSignWord(@Body() dto: CreateSignWordDto) {
    return this.dictionaryService.createSignWord(dto);
  }

  @Put('signs/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Update sign word (Admin only)' })
  @ApiResponse({ status: 200, description: 'Sign word updated' })
  async updateSignWord(@Param('id') id: string, @Body() dto: UpdateSignWordDto) {
    return this.dictionaryService.updateSignWord(id, dto);
  }

  @Delete('signs/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sign word (Admin only)' })
  @ApiResponse({ status: 204, description: 'Sign word deleted' })
  async deleteSignWord(@Param('id') id: string) {
    return this.dictionaryService.deleteSignWord(id);
  }

  // ===========================================================================
  // CATEGORIES
  // ===========================================================================

  @Get('categories')
  @ApiOperation({ summary: 'Get all sign categories with sign counts' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAllCategories() {
    return this.dictionaryService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID with its signs' })
  @ApiResponse({ status: 200, description: 'Category details with signs' })
  async findCategoryById(@Param('id') id: string) {
    return this.dictionaryService.findCategoryById(id);
  }

  @Post('categories')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.dictionaryService.createCategory(dto);
  }

  @Put('categories/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.dictionaryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  async deleteCategory(@Param('id') id: string) {
    return this.dictionaryService.deleteCategory(id);
  }

  // ===========================================================================
  // FAVORITES & STATS
  // ===========================================================================

  @Post('favorites/:signId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Toggle favorite for a sign word' })
  @ApiResponse({ status: 200, description: 'Favorite toggled' })
  async toggleFavorite(@Req() req: any, @Param('signId') signId: string) {
    return this.dictionaryService.toggleFavorite(req.user.id, signId);
  }

  @Get('alphabet-stats')
  @ApiOperation({ summary: 'Get sign count per letter' })
  @ApiResponse({ status: 200, description: 'Alphabet statistics' })
  async getAlphabetStats() {
    return this.dictionaryService.getAlphabetStats();
  }
}
