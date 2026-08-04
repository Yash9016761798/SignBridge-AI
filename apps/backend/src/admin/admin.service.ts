import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      totalDictionarySigns,
      totalAiPredictions,
      totalTranslations,
      practiceSessions,
      certificatesIssued,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.course.count(),
      this.prisma.signWord.count(),
      this.prisma.gesturePrediction.count(),
      this.prisma.translationSession.count(),
      this.prisma.practiceSession.count(),
      this.prisma.certificate.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCourses,
      totalDictionarySigns,
      totalAiPredictions,
      totalTranslations,
      practiceSessions,
      certificatesIssued,
    };
  }

  async getSystemMetrics() {
    const startTime = Date.now();

    let backendStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    let databaseStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    let aiServiceStatus: 'healthy' | 'degraded' | 'down' = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      databaseStatus = 'down';
      backendStatus = 'degraded';
    }

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');
    if (aiServiceUrl) {
      try {
        const response = await fetch(`${aiServiceUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) {
          aiServiceStatus = 'degraded';
        }
      } catch (error) {
        this.logger.warn('AI service health check failed', error);
        aiServiceStatus = 'down';
      }
    } else {
      aiServiceStatus = 'degraded';
    }

    let memoryUsage: { used: number; total: number; percentage: number } | null = null;
    let cpuUsage: number | null = null;
    let storageUsage: { used: number; total: number; percentage: number } | null = null;

    try {
      const os = await import('os');
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      memoryUsage = {
        used: usedMem,
        total: totalMem,
        percentage: Math.round((usedMem / totalMem) * 100),
      };

      const cpus = os.cpus();
      if (cpus.length > 0) {
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach((cpu) => {
          for (const type in cpu.times) {
            totalTick += cpu.times[type as keyof typeof cpu.times];
          }
          totalIdle += cpu.times.idle;
        });
        const avgIdle = totalIdle / cpus.length;
        const avgTotal = totalTick / cpus.length;
        cpuUsage = Math.round(((avgTotal - avgIdle) / avgTotal) * 100);
      }
    } catch (error) {
      this.logger.warn('Failed to get system resource metrics', error);
    }

    const uptime = process.uptime();

    const responseTime = Date.now() - startTime;

    return {
      backendStatus,
      aiServiceStatus,
      databaseStatus,
      storageUsage,
      memoryUsage,
      cpuUsage,
      uptime,
      responseTime,
    };
  }

  async getRecentActivity() {
    const [
      recentRegistrations,
      recentEnrollments,
      recentPredictions,
      recentTranslations,
      recentDictionaryAdditions,
    ] = await Promise.all([
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
      this.prisma.gesturePrediction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          practiceSession: {
            select: {
              userId: true,
            },
          },
        },
      }),
      this.prisma.translationSession.findMany({
        take: 5,
        orderBy: { startedAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.signWord.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const userIds = new Set<string>();
    recentPredictions.forEach((p) => {
      if (p.practiceSession?.userId) {
        userIds.add(p.practiceSession.userId);
      }
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      userRegistrations: recentRegistrations.map((u) => ({
        id: u.id,
        user: {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
        },
        createdAt: u.createdAt.toISOString(),
      })),
      courseEnrollments: recentEnrollments.map((e) => ({
        id: e.id,
        user: {
          firstName: e.user.firstName,
          lastName: e.user.lastName,
        },
        course: {
          title: e.course.title,
        },
        enrolledAt: e.enrolledAt.toISOString(),
      })),
      predictions: recentPredictions.map((p) => {
        const userId = p.practiceSession?.userId;
        const user = userId ? userMap.get(userId) : null;
        return {
          id: p.id,
          user: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
              }
            : null,
          gesture: p.predictedGesture,
          confidence: p.confidence,
          createdAt: p.createdAt.toISOString(),
        };
      }),
      translations: recentTranslations.map((t) => ({
        id: t.id,
        user: {
          firstName: t.user.firstName,
          lastName: t.user.lastName,
        },
        type: t.type,
        status: t.status,
        startedAt: t.startedAt.toISOString(),
      })),
      dictionaryAdditions: recentDictionaryAdditions.map((d) => ({
        id: d.id,
        word: d.word,
        category: {
          name: d.category.name,
        },
        createdAt: d.createdAt.toISOString(),
      })),
    };
  }
}
