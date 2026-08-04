import { Controller, Get, Put, UseGuards, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminSettingsService } from './admin-settings.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('settings')
@Controller('admin/settings')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('firebase-auth')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getSettings(@CurrentUser() _user: AuthenticatedUser) {
    return this.adminSettingsService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Update settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser() _user: AuthenticatedUser,
  ) {
    if (updateSettingsDto.section && updateSettingsDto.data) {
      return this.adminSettingsService.updateSettings(
        updateSettingsDto.section,
        updateSettingsDto.data,
      );
    }

    if (updateSettingsDto.general) {
      return this.adminSettingsService.updateSettings(
        'general',
        updateSettingsDto.general as Record<string, unknown>,
      );
    }
    if (updateSettingsDto.security) {
      return this.adminSettingsService.updateSettings(
        'security',
        updateSettingsDto.security as Record<string, unknown>,
      );
    }
    if (updateSettingsDto.notifications) {
      return this.adminSettingsService.updateSettings(
        'notifications',
        updateSettingsDto.notifications as Record<string, unknown>,
      );
    }
    if (updateSettingsDto.appearance) {
      return this.adminSettingsService.updateSettings(
        'appearance',
        updateSettingsDto.appearance as Record<string, unknown>,
      );
    }
    if (updateSettingsDto.ai) {
      return this.adminSettingsService.updateSettings(
        'ai',
        updateSettingsDto.ai as Record<string, unknown>,
      );
    }

    return this.adminSettingsService.getSettings();
  }
}
