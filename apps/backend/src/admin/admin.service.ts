import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

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

    const aiServiceUrl = process.env.AI_SERVICE_URL;
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

  async getUsers(query: QueryUserDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = { name: query.role as UserRole };
    }

    if (query.status) {
      if (query.status === 'active') {
        where.isActive = true;
      } else if (query.status === 'inactive') {
        where.isActive = false;
      } else if (query.status === 'suspended') {
        where.isActive = false;
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const userIds = users.map((u) => u.id);

    const [enrollments, completedEnrollments] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { userId: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, completedAt: { not: null } },
        _count: { userId: true },
      }),
    ]);

    const enrollmentMap = new Map(enrollments.map((e) => [e.userId, e._count.userId]));
    const completedEnrollmentMap = new Map(
      completedEnrollments.map((e) => [e.userId, e._count.userId]),
    );

    const data = users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role.name,
      status: u.isActive ? 'active' : 'inactive',
      profileImage: u.profileImage,
      isVerified: u.isVerified,
      organizationId: u.organizationId,
      organizationName: u.organization?.name || null,
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      enrolledCourses: enrollmentMap.get(u.id) || 0,
      completedCourses: completedEnrollmentMap.get(u.id) || 0,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      enrolledCoursesCount,
      completedCoursesCount,
      certificatesCount,
      practiceSessionsCount,
      translationsCount,
      enrollments,
      certificates,
      practiceSessions,
      translationSessions,
      gesturePredictions,
      recentActivity,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where: { userId: id } }),
      this.prisma.enrollment.count({ where: { userId: id, completedAt: { not: null } } }),
      this.prisma.certificate.count({ where: { userId: id } }),
      this.prisma.practiceSession.count({ where: { userId: id } }),
      this.prisma.translationSession.count({ where: { userId: id } }),
      this.prisma.enrollment.findMany({
        where: { userId: id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              status: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 10,
      }),
      this.prisma.certificate.findMany({
        where: { userId: id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { issuedDate: 'desc' },
        take: 10,
      }),
      this.prisma.practiceSession.findMany({
        where: { userId: id },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.translationSession.findMany({
        where: { userId: id },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
      this.prisma.gesturePrediction.findMany({
        where: {
          practiceSession: { userId: id },
        },
        select: {
          id: true,
          confidence: true,
          predictedGesture: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.activityLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalPredictions = gesturePredictions.length;
    const avgConfidence =
      totalPredictions > 0
        ? gesturePredictions.reduce((sum, p) => sum + p.confidence, 0) / totalPredictions
        : 0;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      status: user.isActive ? 'active' : 'inactive',
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      organizationId: user.organizationId,
      organizationName: user.organization?.name || null,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      phone: user.phone,
      dateOfBirth: user.dateOfBirth?.toISOString() || null,
      bio: user.bio,
      country: user.country,
      state: user.state,
      city: user.city,
      enrolledCourses: enrolledCoursesCount,
      completedCourses: completedCoursesCount,
      certificates: certificatesCount,
      practiceSessions: practiceSessionsCount,
      translations: translationsCount,
      courses: enrollments.map((e) => ({
        id: e.course.id,
        title: e.course.title,
        difficulty: e.course.difficulty,
        status: e.course.status,
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt?.toISOString() || null,
      })),
      certificateList: certificates.map((c) => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        verificationCode: c.verificationCode,
        issuedDate: c.issuedDate.toISOString(),
        course: {
          title: c.course.title,
        },
      })),
      practiceHistory: practiceSessions.map((ps) => ({
        id: ps.id,
        lesson: ps.lesson ? { title: ps.lesson.title } : null,
        confidenceScore: ps.confidenceScore,
        accuracy: ps.accuracy,
        duration: ps.duration,
        createdAt: ps.createdAt.toISOString(),
      })),
      translationHistory: translationSessions.map((ts) => ({
        id: ts.id,
        type: ts.type,
        status: ts.status,
        startedAt: ts.startedAt.toISOString(),
        endedAt: ts.endedAt?.toISOString() || null,
      })),
      aiStatistics: {
        totalPredictions,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        recentPredictions: gesturePredictions.map((p) => ({
          id: p.id,
          gesture: p.predictedGesture,
          confidence: p.confidence,
          createdAt: p.createdAt.toISOString(),
        })),
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.UserUpdateInput = {};

    if (updateUserDto.firstName !== undefined) {
      data.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      data.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email;
    }
    if (updateUserDto.role !== undefined) {
      const roleRecord = await this.prisma.role.findUnique({
        where: { name: updateUserDto.role as UserRole },
      });
      if (!roleRecord) {
        throw new NotFoundException(`Role ${updateUserDto.role} not found`);
      }
      data.role = { connect: { id: roleRecord.id } };
    }
    if (updateUserDto.status !== undefined) {
      data.isActive = updateUserDto.status === 'active';
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
      status: updatedUser.isActive ? 'active' : 'inactive',
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      organizationId: updatedUser.organizationId,
      organizationName: updatedUser.organization?.name || null,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() || null,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  async suspendUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
      status: 'inactive',
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      organizationId: updatedUser.organizationId,
      organizationName: updatedUser.organization?.name || null,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() || null,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  async activateUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role.name,
      status: 'active',
      profileImage: updatedUser.profileImage,
      isVerified: updatedUser.isVerified,
      organizationId: updatedUser.organizationId,
      organizationName: updatedUser.organization?.name || null,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() || null,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { success: true, message: 'User soft deleted successfully' };
  }
}
