import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAnswerOptionDto {
  @ApiProperty({ example: 'Open palm raised near face' })
  @IsString()
  text!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect!: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order!: number;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'What does the ISL sign for "Hello" typically involve?' })
  @IsString()
  text!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order!: number;

  @ApiProperty({ type: [CreateAnswerOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions!: CreateAnswerOptionDto[];
}

export class CreateQuizDto {
  @ApiProperty({ example: 'ISL Basics Quiz' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Test your knowledge of ISL fundamentals' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiProperty({ description: 'Course ID' })
  @IsString()
  courseId!: string;

  @ApiPropertyOptional({ type: [CreateQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class UpdateQuizDto extends PartialType(CreateQuizDto) {}

export class SubmitQuizAttemptDto {
  @ApiProperty({ description: 'Quiz ID' })
  @IsString()
  quizId!: string;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeTaken?: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
    example: {
      q1: 'optionA',
      q2: 'optionC',
    },
  })
  @IsObject()
  answers!: Record<string, string>;
}
