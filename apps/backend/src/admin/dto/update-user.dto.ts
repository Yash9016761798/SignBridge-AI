import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Priya' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Sharma' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'priya.sharma@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: ['LEARNER', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN'] })
  @IsEnum(['LEARNER', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN'] as const)
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended'] })
  @IsEnum(['active', 'inactive', 'suspended'] as const)
  @IsOptional()
  status?: string;
}
