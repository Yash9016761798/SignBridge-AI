import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrameLandmarks, PoseSequence } from './pose.dto';

export class PredictGestureDto {
  @ApiProperty({ enum: ['image', 'video', 'landmarks'], example: 'image' })
  @IsEnum(['image', 'video', 'landmarks'] as const)
  type!: string;

  @ApiPropertyOptional({ description: 'Practice session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export const PREDICTION_INPUT_TYPES = ['image', 'video', 'landmarks'] as const;
export const INPUT_SOURCE_TYPES = ['camera', 'upload', 'demo'] as const;

export class PredictionRequest {
  @ApiProperty({ enum: PREDICTION_INPUT_TYPES, example: 'landmarks' })
  @IsEnum(PREDICTION_INPUT_TYPES)
  type!: string;

  @ApiPropertyOptional({
    enum: INPUT_SOURCE_TYPES,
    example: 'camera',
    description: 'Source of the input data',
  })
  @IsOptional()
  @IsEnum(INPUT_SOURCE_TYPES)
  inputType?: string;

  @ApiPropertyOptional({ description: 'Practice session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    type: FrameLandmarks,
    description: 'Single frame of structured landmark data',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FrameLandmarks)
  frames?: FrameLandmarks;

  @ApiPropertyOptional({
    type: PoseSequence,
    description: 'Sequence of frames for temporal prediction',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoseSequence)
  sequence?: PoseSequence;

  @ApiPropertyOptional({
    description: 'Pose sequence as flat array (backward-compatible): shape [T, 33, 5]',
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'number' },
      },
    },
  })
  @IsOptional()
  @IsArray()
  pose_sequence?: number[][][];

  @ApiPropertyOptional({ example: 30, description: 'Maximum sequence length for generation' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  max_length?: number;

  @ApiPropertyOptional({ example: 1.0, description: 'Sampling temperature' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(2.0)
  temperature?: number;
}

export class AlternativePrediction {
  @ApiProperty({ example: 'Thank You' })
  @IsString()
  gesture!: string;

  @ApiProperty({ example: 0.78 })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number;
}

export class PredictionData {
  @ApiProperty({ example: 'Hello' })
  @IsString()
  gesture!: string;

  @ApiProperty({ example: 0.92 })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number;

  @ApiProperty({ type: [AlternativePrediction] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativePrediction)
  alternatives!: AlternativePrediction[];

  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(0)
  processingTimeMs!: number;

  @ApiProperty({ example: 'mock-v1.0.0' })
  @IsString()
  modelVersion!: string;

  @ApiProperty({ example: 'landmarks' })
  @IsString()
  predictionType!: string;
}

export class PredictionMeta {
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'ISO timestamp' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ description: 'Session ID from request, if provided' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    enum: INPUT_SOURCE_TYPES,
    description: 'Input source type from request, if provided',
  })
  @IsOptional()
  @IsEnum(INPUT_SOURCE_TYPES)
  inputType?: string;
}

export class PredictionResponse {
  @ApiProperty({ example: true })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({ example: 'Prediction completed successfully' })
  @IsString()
  message!: string;

  @ApiProperty({ type: PredictionData })
  @ValidateNested()
  @Type(() => PredictionData)
  data!: PredictionData;

  @ApiProperty({ type: PredictionMeta })
  @ValidateNested()
  @Type(() => PredictionMeta)
  meta!: PredictionMeta;
}
