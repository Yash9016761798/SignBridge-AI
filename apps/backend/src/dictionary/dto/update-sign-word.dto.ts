import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';

export class UpdateSignWordDto {
  @ApiPropertyOptional({ description: 'The sign word in English', example: 'Hello' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  word?: string;

  @ApiPropertyOptional({ description: 'Meaning/definition of the sign', example: 'A greeting gesture' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meaning?: string;

  @ApiPropertyOptional({ description: 'Category ID this sign belongs to' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'URL to the sign video' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'URL to the sign image' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Difficulty level', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] })
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const)
  @IsOptional()
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @ApiPropertyOptional({ description: 'Tags for the sign', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
