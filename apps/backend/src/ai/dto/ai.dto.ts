import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PredictGestureDto {
  @ApiProperty({ enum: ['image', 'video', 'landmarks'], example: 'image' })
  @IsEnum(['image', 'video', 'landmarks'] as const)
  type!: string;

  @ApiPropertyOptional({ description: 'Practice session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
