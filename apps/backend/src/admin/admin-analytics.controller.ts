import { Controller, Get, UseGuards, Query, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { AdminAnalyticsService } from './admin-analytics.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { AnalyticsQueryDto, ExportQueryDto } from './dto/analytics-query.dto';

@ApiTags('analytics')
@Controller('admin/analytics')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('firebase-auth')
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getUsersAnalytics(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() _user: AuthenticatedUser,
  ) {
    return this.adminAnalyticsService.getUsersAnalytics(query.range || '30d');
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get course analytics' })
  @ApiResponse({ status: 200, description: 'Course analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getCoursesAnalytics(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() _user: AuthenticatedUser,
  ) {
    return this.adminAnalyticsService.getCoursesAnalytics(query.range || '30d');
  }

  @Get('dictionary')
  @ApiOperation({ summary: 'Get dictionary analytics' })
  @ApiResponse({ status: 200, description: 'Dictionary analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getDictionaryAnalytics(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() _user: AuthenticatedUser,
  ) {
    return this.adminAnalyticsService.getDictionaryAnalytics(query.range || '30d');
  }

  @Get('ai')
  @ApiOperation({ summary: 'Get AI analytics' })
  @ApiResponse({ status: 200, description: 'AI analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAiAnalytics(@Query() query: AnalyticsQueryDto, @CurrentUser() _user: AuthenticatedUser) {
    return this.adminAnalyticsService.getAiAnalytics(query.range || '30d');
  }

  @Get('export')
  @ApiOperation({ summary: 'Export analytics data' })
  @ApiProduces('text/csv', 'application/json')
  @ApiResponse({ status: 200, description: 'Analytics data exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async exportAnalytics(@Query() query: ExportQueryDto, @CurrentUser() _user: AuthenticatedUser) {
    const exportData = await this.adminAnalyticsService.getExportData(query.format || 'csv');
    const buffer = Buffer.from(exportData.content, 'utf-8');
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${exportData.filename}"`,
      type: exportData.contentType,
    });
  }
}
