import { IsString, IsOptional, IsInt, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePracticeSessionDto {
  @ApiPropertyOptional({ description: 'Lesson ID to practice' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Target gesture to practice' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetGesture?: string;
}

export class SubmitPredictionDto {
  @ApiProperty({ description: 'Practice session ID' })
  @IsString()
  sessionId!: string;

  @ApiProperty({ example: 'Hello' })
  @IsString()
  predictedGesture!: string;

  @ApiProperty({ example: 0.92 })
  @IsNumber()
  @Min(0)
  confidence!: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsInt()
  @Min(0)
  processingTimeMs?: number;

  @ApiPropertyOptional({ example: 'mock-v1.0.0' })
  @IsOptional()
  @IsString()
  modelVersion?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isCorrect?: boolean;
}
