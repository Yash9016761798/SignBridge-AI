import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUserDto {
  @ApiPropertyOptional({ description: 'Search term for name or email' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: ['LEARNER', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN'],
  })
  @IsEnum(['LEARNER', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN'] as const)
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsEnum(['active', 'inactive', 'suspended'] as const)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsEnum(['asc', 'desc'] as const)
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
