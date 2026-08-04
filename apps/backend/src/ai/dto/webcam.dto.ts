import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebcamFrameDto {
  @ApiProperty({
    type: [[[Number]]],
    description:
      'Webcam pose frame sequence, shape (T, 33, 5). Each frame is 33 landmarks with 5 features [x, y, z, visibility, timestamp].',
  })
  @IsArray()
  @ArrayMinSize(1)
  frameData!: number[][][];

  @ApiPropertyOptional({ description: 'Client session identifier' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
