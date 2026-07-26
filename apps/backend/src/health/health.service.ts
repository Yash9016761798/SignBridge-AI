import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class HealthService extends HealthIndicator {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database health check passed');
      return this.getStatus(key, true, {
        status: 'up',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return this.getStatus(key, false, {
        status: 'down',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      });
    }
  }

  async isLive(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async isReady(): Promise<{
    status: string;
    timestamp: string;
    database: string;
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }
}
