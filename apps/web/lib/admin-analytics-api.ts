import apiClient from './api';
import type {
  AnalyticsDashboard,
  TimeRange,
  BreakdownItem,
  TopListItem,
} from '@/types/admin-analytics';

function toBreakdown(items: any[]): BreakdownItem[] {
  return items.map((item) => ({
    label: item.label || '',
    value: item.value || 0,
    percent: item.percent || 0,
    color: item.color || '',
  }));
}

function toTopList(items: any[]): TopListItem[] {
  return items.map((item, i) => ({
    rank: item.rank || i + 1,
    name: item.name || '',
    value: item.value || 0,
    subtitle: item.subtitle || '',
  }));
}

export const adminAnalyticsApi = {
  async getDashboard(range: TimeRange = '30d'): Promise<AnalyticsDashboard> {
    const [usersData, coursesData, dictionaryData, aiData] = await Promise.all([
      apiClient.get('/admin/analytics/users', { params: { range } }) as any,
      apiClient.get('/admin/analytics/courses', { params: { range } }) as any,
      apiClient.get('/admin/analytics/dictionary', { params: { range } }) as any,
      apiClient.get('/admin/analytics/ai', { params: { range } }) as any,
    ]);

    const summary = {
      totalUsers: usersData.totalUsers || 0,
      activeUsers: usersData.activeUsers || 0,
      totalCourses: coursesData.totalCourses || 0,
      totalCertificates: 0,
      totalSigns: dictionaryData.totalSigns || 0,
      totalPredictions: aiData.totalPredictions || 0,
      totalTranslations: aiData.totalTranslations || 0,
      completionRate: coursesData.completionRate || 0,
      userGrowthPercent: 0,
      courseEnrollmentPercent: 0,
      predictionGrowthPercent: 0,
    };

    return {
      summary,
      userGrowth: usersData.registrationTimeline || [],
      dailyActiveUsers: [],
      courseCompletion: coursesData.courseTrends || [],
      learningProgress: [],
      dictionaryUsage: dictionaryData.usageTrends || [],
      predictionVolume: [],
      translationVolume: [],
      quizSuccessRate: [],
      certificateIssuance: [],
      usersByRole: toBreakdown(usersData.usersByRole || []),
      usersByCountry: toBreakdown(usersData.usersByCountry || []),
      usersByDevice: [],
      coursesByCategory: toBreakdown(coursesData.coursesByCategory || []),
      coursesByDifficulty: toBreakdown(coursesData.coursesByDifficulty || []),
      dictionaryByCategory: toBreakdown(dictionaryData.dictionaryByCategory || []),
      predictionsByGesture: [],
      topCourses: toTopList(coursesData.popularCourses || []),
      topSigns: [],
      topLearners: [],
      mostActiveUsers: [],
    };
  },

  async exportData(format: string): Promise<{ success: boolean; message: string }> {
    const { data } = (await apiClient.get('/admin/analytics/export', {
      params: { format },
    })) as any;
    return data;
  },
};
