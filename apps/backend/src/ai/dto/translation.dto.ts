import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTranslationSessionDto {
  @ApiProperty({
    enum: ['TEXT_TO_SIGN', 'SPEECH_TO_SIGN', 'SIGN_TO_TEXT'],
    example: 'TEXT_TO_SIGN',
  })
  @IsEnum(['TEXT_TO_SIGN', 'SPEECH_TO_SIGN', 'SIGN_TO_TEXT'] as const)
  type!: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @ApiPropertyOptional({ example: 'isl' })
  @IsOptional()
  @IsString()
  targetLanguage?: string;
}

export class PoseFrameDto {
  @ApiProperty({
    type: [[Number]],
    description: 'Pose landmarks array of shape (33, 5): [x, y, z, visibility, timestamp]',
  })
  @IsArray()
  @ArrayMinSize(33)
  @ArrayMaxSize(33)
  landmarks!: number[][];

  @ApiPropertyOptional({ description: 'Frame timestamp in milliseconds' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class TranslateTextDto {
  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  @MaxLength(5000)
  text!: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @ApiPropertyOptional({ example: 'isl' })
  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @ApiPropertyOptional({ description: 'Translation session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    type: PoseFrameDto,
    description: 'Pose frame data for sign-to-text translation',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoseFrameDto)
  frame?: PoseFrameDto;
}
