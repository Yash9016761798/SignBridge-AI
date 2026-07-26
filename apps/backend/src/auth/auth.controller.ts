import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshTokenDto } from './dto/auth.dto';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  AuthUserResponseDto,
} from './dto/auth-response.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/auth.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with Firebase ID token. Creates new user on first login or updates existing user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiHeader({
    name: 'x-request-id',
    description: 'Request ID for tracing',
    required: false,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authService.login(loginDto.idToken);
    const userData = new AuthUserResponseDto(user);
    return new LoginResponseDto(userData);
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate session.',
  })
  @ApiBearerAuth('firebase-auth')
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({
    name: 'x-request-id',
    description: 'Request ID for tracing',
    required: false,
  })
  async logout(
    @Body() logoutDto: LogoutDto,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<LogoutResponseDto> {
    await this.authService.logout(logoutDto.idToken);
    return new LogoutResponseDto();
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile.',
  })
  @ApiBearerAuth('firebase-auth')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({
    name: 'x-request-id',
    description: 'Request ID for tracing',
    required: false,
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    };
  }

  @Post('refresh')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh authentication',
    description: 'Refresh authentication by re-validating the Firebase token.',
  })
  @ApiBearerAuth('firebase-auth')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({
    name: 'x-request-id',
    description: 'Request ID for tracing',
    required: false,
  })
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<RefreshResponseDto> {
    const updatedUser = await this.authService.refreshToken(refreshDto.idToken);
    const userData = new AuthUserResponseDto(updatedUser);
    return new RefreshResponseDto(userData);
  }
}
