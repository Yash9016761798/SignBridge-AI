import { IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  lessonId!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  watchTime?: number;

  @ApiPropertyOptional({ example: 0.92 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;
}
