import { Controller, Get, Put, Patch, Delete, UseGuards, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('firebase-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStats(@CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/system-metrics')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getSystemMetrics(@CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.getSystemMetrics();
  }

  @Get('dashboard/recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getRecentActivity(@CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.getRecentActivity();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with pagination, search, filtering, and sorting' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getUsers(@Query() query: QueryUserDto, @CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string, @CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() _user: AuthenticatedUser,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async suspendUser(@Param('id') id: string, @CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.suspendUser(id);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(@Param('id') id: string, @CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.activateUser(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @CurrentUser() _user: AuthenticatedUser) {
    return this.adminService.deleteUser(id);
  }
}
