import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getRangeDates(range: string): { startDate: Date } {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return { startDate };
  }

  private async getTimeSeriesData(
    table: string,
    dateColumn: string,
    startDate: Date,
  ): Promise<{ date: string; count: number }[]> {
    const allowedTables = [
      'users',
      'enrollments',
      'sign_words',
      'practice_sessions',
      'gesture_predictions',
      'translation_sessions',
    ];
    if (!allowedTables.includes(table)) {
      throw new Error(`Invalid table: ${table}`);
    }

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT TO_CHAR(${dateColumn}::date, 'YYYY-MM-DD') as date, COUNT(*) as count
      FROM ${Prisma.raw(table)}
      WHERE ${dateColumn} >= ${startDate}
      GROUP BY TO_CHAR(${dateColumn}::date, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
    return result.map((row) => ({ date: row.date, count: Number(row.count) }));
  }

  private fillMissingDates(
    data: { date: string; count: number }[],
    startDate: Date,
    range: string,
  ): { label: string; value: number }[] {
    const days =
      range === 'today'
        ? 1
        : range === '7d'
          ? 7
          : range === '30d'
            ? 30
            : range === '90d'
              ? 90
              : 365;
    const result: { label: string; value: number }[] = [];
    const dataMap = new Map(data.map((d) => [d.date, d.count]));

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      result.push({ label, value: dataMap.get(dateStr) || 0 });
    }

    return result;
  }

  async getUsersAnalytics(range: string) {
    const { startDate } = this.getRangeDates(range);

    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    ]);

    const userGrowth = await this.getTimeSeriesData('users', 'created_at', startDate);
    const registrationTimeline = this.fillMissingDates(userGrowth, startDate, range);

    const [usersByRole, usersByCountry] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['roleId'],
        _count: { roleId: true },
      }),
      this.prisma.user.groupBy({
        by: ['country'],
        where: { country: { not: null } },
        _count: { country: true },
      }),
    ]);

    const roles = await this.prisma.role.findMany();
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    const usersByRoleData = usersByRole
      .map((item) => ({
        label: roleMap.get(item.roleId) || 'Unknown',
        value: item._count.roleId,
        percent: 0,
      }))
      .sort((a, b) => b.value - a.value);

    const totalRoleCount = usersByRoleData.reduce((sum, item) => sum + item.value, 0);
    usersByRoleData.forEach((item) => {
      item.percent = totalRoleCount > 0 ? Math.round((item.value / totalRoleCount) * 100) / 100 : 0;
    });

    const usersByCountryData = usersByCountry
      .map((item) => ({
        label: item.country || 'Unknown',
        value: item._count.country,
        percent: 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const totalCountryCount = usersByCountryData.reduce((sum, item) => sum + item.value, 0);
    usersByCountryData.forEach((item) => {
      item.percent =
        totalCountryCount > 0 ? Math.round((item.value / totalCountryCount) * 100) / 100 : 0;
    });

    return {
      totalUsers,
      activeUsers,
      newUsers,
      growthTrend: registrationTimeline,
      registrationTimeline,
      usersByRole: usersByRoleData,
      usersByCountry: usersByCountryData,
    };
  }

  async getCoursesAnalytics(range: string) {
    const { startDate } = this.getRangeDates(range);

    const [totalCourses, totalEnrollments, completedEnrollments] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { completedAt: { not: null } } }),
    ]);

    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) / 100 : 0;

    const enrollmentTrend = await this.getTimeSeriesData('enrollments', 'enrolled_at', startDate);

    const popularCourses = await this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 10,
    });

    const coursesByCategory = await this.prisma.course.groupBy({
      by: ['difficulty'],
      _count: { difficulty: true },
    });

    const coursesByDifficulty = await this.prisma.course.groupBy({
      by: ['difficulty'],
      where: { status: 'PUBLISHED' },
      _count: { difficulty: true },
    });

    const coursesByCategoryData = coursesByCategory.map((item) => ({
      label: item.difficulty,
      value: item._count.difficulty,
      percent: 0,
    }));

    const totalCategoryCount = coursesByCategoryData.reduce((sum, item) => sum + item.value, 0);
    coursesByCategoryData.forEach((item) => {
      item.percent =
        totalCategoryCount > 0 ? Math.round((item.value / totalCategoryCount) * 100) / 100 : 0;
    });

    const coursesByDifficultyData = coursesByDifficulty.map((item) => ({
      label: item.difficulty,
      value: item._count.difficulty,
      percent: 0,
    }));

    const totalDifficultyCount = coursesByDifficultyData.reduce((sum, item) => sum + item.value, 0);
    coursesByDifficultyData.forEach((item) => {
      item.percent =
        totalDifficultyCount > 0 ? Math.round((item.value / totalDifficultyCount) * 100) / 100 : 0;
    });

    return {
      totalCourses,
      enrollments: totalEnrollments,
      completionRate,
      popularCourses: popularCourses.map((c) => ({
        id: c.id,
        title: c.title,
        enrollments: c._count.enrollments,
      })),
      courseTrends: this.fillMissingDates(enrollmentTrend, startDate, range),
      coursesByCategory: coursesByCategoryData,
      coursesByDifficulty: coursesByDifficultyData,
    };
  }

  async getDictionaryAnalytics(range: string) {
    const { startDate } = this.getRangeDates(range);

    const [totalSigns, totalCategories, totalFavorites] = await Promise.all([
      this.prisma.signWord.count(),
      this.prisma.signCategory.count(),
      this.prisma.favoriteSign.count(),
    ]);

    const signTrend = await this.getTimeSeriesData('sign_words', 'created_at', startDate);

    const dictionaryByCategory = await this.prisma.signWord.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
    });

    const categories = await this.prisma.signCategory.findMany({
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const dictionaryByCategoryData = dictionaryByCategory
      .map((item) => ({
        label: categoryMap.get(item.categoryId) || 'Unknown',
        value: item._count.categoryId,
        percent: 0,
      }))
      .sort((a, b) => b.value - a.value);

    const totalCategoryCount = dictionaryByCategoryData.reduce((sum, item) => sum + item.value, 0);
    dictionaryByCategoryData.forEach((item) => {
      item.percent =
        totalCategoryCount > 0 ? Math.round((item.value / totalCategoryCount) * 100) / 100 : 0;
    });

    return {
      totalSigns,
      categories: totalCategories,
      searchStatistics: 0,
      favorites: totalFavorites,
      usageTrends: this.fillMissingDates(signTrend, startDate, range),
      dictionaryByCategory: dictionaryByCategoryData,
    };
  }

  async getAiAnalytics(range: string) {
    const { startDate } = this.getRangeDates(range);

    const [totalPredictions, totalTranslations, webcamSessions] = await Promise.all([
      this.prisma.gesturePrediction.count(),
      this.prisma.translationSession.count(),
      this.prisma.practiceSession.count(),
    ]);

    const predictionsInRange = await this.prisma.gesturePrediction.findMany({
      where: { createdAt: { gte: startDate } },
      select: { confidence: true, processingTime: true, modelVersion: true },
    });

    const totalInRange = predictionsInRange.length;
    const averageConfidence =
      totalInRange > 0
        ? predictionsInRange.reduce((sum, p) => sum + p.confidence, 0) / totalInRange
        : 0;

    const processingTimes = predictionsInRange.filter((p) => p.processingTime !== null);
    const averageProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((sum, p) => sum + (p.processingTime || 0), 0) /
          processingTimes.length
        : 0;

    const modelVersionMap = new Map<string, number>();
    predictionsInRange.forEach((p) => {
      const version = p.modelVersion || 'unknown';
      modelVersionMap.set(version, (modelVersionMap.get(version) || 0) + 1);
    });

    const modelVersionUsage = Array.from(modelVersionMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const successCount = predictionsInRange.filter((p) => p.confidence >= 0.5).length;
    const successRate =
      totalInRange > 0 ? Math.round((successCount / totalInRange) * 100) / 100 : 0;

    return {
      totalPredictions,
      totalTranslations,
      webcamSessions,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      modelVersionUsage,
      successRate,
    };
  }

  async getExportData(
    format: string,
  ): Promise<{ content: string; filename: string; contentType: string }> {
    const [users, courses, signs, predictions, translations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.signWord.count(),
      this.prisma.gesturePrediction.count(),
      this.prisma.translationSession.count(),
    ]);

    const data = {
      totalUsers: users,
      totalCourses: courses,
      totalSigns: signs,
      totalPredictions: predictions,
      totalTranslations: translations,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      return {
        content: JSON.stringify(data, null, 2),
        filename: `analytics-export-${Date.now()}.json`,
        contentType: 'application/json',
      };
    }

    const csvRows = [
      ['Metric', 'Value'],
      ['Total Users', String(data.totalUsers)],
      ['Total Courses', String(data.totalCourses)],
      ['Total Signs', String(data.totalSigns)],
      ['Total Predictions', String(data.totalPredictions)],
      ['Total Translations', String(data.totalTranslations)],
      ['Exported At', data.exportedAt],
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    return {
      content: csvContent,
      filename: `analytics-export-${Date.now()}.csv`,
      contentType: 'text/csv',
    };
  }
}
