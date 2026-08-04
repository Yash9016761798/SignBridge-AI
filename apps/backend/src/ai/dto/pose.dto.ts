import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const NUM_POSE_LANDMARKS = 33;
export const NUM_HAND_LANDMARKS = 21;
export const NUM_FACE_LANDMARKS = 468;
export const NUM_LANDMARK_FEATURES = 5;

export class PoseLandmark {
  @ApiProperty({
    example: 0.5,
    description: 'X coordinate, normalized to [0, 1] relative to frame width',
  })
  @IsNumber({}, { message: 'x must be a number' })
  @Min(-1)
  @Max(1)
  x!: number;

  @ApiProperty({
    example: 0.3,
    description: 'Y coordinate, normalized to [0, 1] relative to frame height',
  })
  @IsNumber({}, { message: 'y must be a number' })
  @Min(-1)
  @Max(1)
  y!: number;

  @ApiProperty({
    example: 0.1,
    description: 'Z coordinate, relative depth in same units as x and y',
  })
  @IsNumber({}, { message: 'z must be a number' })
  @Min(-1)
  @Max(1)
  z!: number;

  @ApiPropertyOptional({
    example: 0.95,
    description: 'Visibility/landmark-presence confidence (0-1)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  visibility?: number;

  @ApiPropertyOptional({
    description: 'Frame timestamp in milliseconds',
    example: 1700000000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timestamp?: number;
}

export class HandLandmark {
  @ApiProperty({
    example: 0.5,
    description: 'X coordinate, normalized to [0, 1]',
  })
  @IsNumber({}, { message: 'x must be a number' })
  @Min(-1)
  @Max(1)
  x!: number;

  @ApiProperty({
    example: 0.3,
    description: 'Y coordinate, normalized to [0, 1]',
  })
  @IsNumber({}, { message: 'y must be a number' })
  @Min(-1)
  @Max(1)
  y!: number;

  @ApiProperty({
    example: 0.1,
    description: 'Z coordinate, relative depth',
  })
  @IsNumber({}, { message: 'z must be a number' })
  @Min(-1)
  @Max(1)
  z!: number;

  @ApiPropertyOptional({
    example: 0.9,
    description: 'Visibility/presence confidence (0-1)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  visibility?: number;
}

export class FaceLandmark {
  @ApiProperty({
    example: 0.5,
    description: 'X coordinate, normalized to [0, 1]',
  })
  @IsNumber({}, { message: 'x must be a number' })
  @Min(-1)
  @Max(1)
  x!: number;

  @ApiProperty({
    example: 0.3,
    description: 'Y coordinate, normalized to [0, 1]',
  })
  @IsNumber({}, { message: 'y must be a number' })
  @Min(-1)
  @Max(1)
  y!: number;

  @ApiProperty({
    example: 0.1,
    description: 'Z coordinate, relative depth',
  })
  @IsNumber({}, { message: 'z must be a number' })
  @Min(-1)
  @Max(1)
  z!: number;

  @ApiPropertyOptional({
    example: 0.85,
    description: 'Visibility/presence confidence (0-1)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  visibility?: number;
}

export class FrameLandmarks {
  @ApiProperty({
    type: [PoseLandmark],
    description: `Pose landmarks (${NUM_POSE_LANDMARKS} points)`,
    example: Array(NUM_POSE_LANDMARKS).fill({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 0.9,
      timestamp: 1700000000000,
    }),
  })
  @IsArray()
  @ArrayMinSize(NUM_POSE_LANDMARKS)
  @ArrayMaxSize(NUM_POSE_LANDMARKS)
  @ValidateNested({ each: true })
  @Type(() => PoseLandmark)
  pose!: PoseLandmark[];

  @ApiPropertyOptional({
    type: [HandLandmark],
    description: `Left hand landmarks (${NUM_HAND_LANDMARKS} points)`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(NUM_HAND_LANDMARKS)
  @ArrayMaxSize(NUM_HAND_LANDMARKS)
  @ValidateNested({ each: true })
  @Type(() => HandLandmark)
  leftHand?: HandLandmark[];

  @ApiPropertyOptional({
    type: [HandLandmark],
    description: `Right hand landmarks (${NUM_HAND_LANDMARKS} points)`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(NUM_HAND_LANDMARKS)
  @ArrayMaxSize(NUM_HAND_LANDMARKS)
  @ValidateNested({ each: true })
  @Type(() => HandLandmark)
  rightHand?: HandLandmark[];

  @ApiPropertyOptional({
    type: [FaceLandmark],
    description: `Face landmarks (${NUM_FACE_LANDMARKS} points)`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(NUM_FACE_LANDMARKS)
  @ArrayMaxSize(NUM_FACE_LANDMARKS)
  @ValidateNested({ each: true })
  @Type(() => FaceLandmark)
  face?: FaceLandmark[];

  @ApiPropertyOptional({
    description: 'Frame timestamp in milliseconds',
    example: 1700000000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timestamp?: number;
}

export class PoseSequence {
  @ApiProperty({
    type: [FrameLandmarks],
    description: 'Sequence of pose frames for temporal prediction',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => FrameLandmarks)
  frames!: FrameLandmarks[];

  @ApiPropertyOptional({
    description: 'Timestamp of the first frame in the sequence',
    example: 1700000000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequenceTimestamp?: number;
}
