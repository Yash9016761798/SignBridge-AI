import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid-string' })
  id!: string;

  @ApiProperty({ description: 'Firebase UID', example: 'firebase-uid-string' })
  firebaseUid!: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName!: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName!: string;

  @ApiProperty({ description: 'User role', example: 'LEARNER' })
  role!: string;

  @ApiProperty({ description: 'Role ID', example: 'uuid-string' })
  roleId!: string;

  @ApiPropertyOptional({ description: 'Organization ID', example: 'uuid-string' })
  organizationId?: string;

  @ApiProperty({ description: 'Email verified', example: true })
  isVerified!: boolean;

  @ApiProperty({ description: 'Account active', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Last login timestamp', example: '2026-07-25T10:00:00Z' })
  lastLoginAt!: Date;

  @ApiProperty({ description: 'Account creation timestamp', example: '2026-07-25T10:00:00Z' })
  createdAt!: Date;

  constructor(partial: Partial<AuthUserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Login successful' })
  message: string;

  @ApiProperty({ description: 'User data', type: AuthUserResponseDto })
  data: AuthUserResponseDto;

  constructor(data: AuthUserResponseDto) {
    this.success = true;
    this.message = 'Login successful';
    this.data = data;
  }
}

export class LogoutResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Logout successful' })
  message: string;

  constructor() {
    this.success = true;
    this.message = 'Logout successful';
  }
}

export class RefreshResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Token refreshed successfully' })
  message: string;

  @ApiProperty({ description: 'User data', type: AuthUserResponseDto })
  data: AuthUserResponseDto;

  constructor(data: AuthUserResponseDto) {
    this.success = true;
    this.message = 'Token refreshed successfully';
    this.data = data;
  }
}
