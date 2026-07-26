import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
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
}
