import type {
  AnalyticsDashboard,
  TimeRange,
  ChartDataPoint,
  BreakdownItem,
  TopListItem,
} from '@/types/admin-analytics';

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function genTimeSeries(days: number, base: number, variance: number): ChartDataPoint[] {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 86400000);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, value: Math.max(0, Math.round(base + rand(-variance, variance) + (i * base * 0.003))) };
  });
}

function genWeekdayData(base: number): ChartDataPoint[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ label: d, value: Math.round(base + rand(-base * 0.3, base * 0.3)) }));
}

const BREAKDOWN_COLORS = ['bg-primary-500', 'bg-info-500', 'bg-success-500', 'bg-warning-500', 'bg-danger-500', 'bg-secondary-500', 'bg-surface-400', 'bg-sky-400'];

export const adminAnalyticsApi = {
  async getDashboard(range: TimeRange = '30d'): Promise<AnalyticsDashboard> {
    await delay(400);
    const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const base = range === 'today' ? 50 : 80;

    const summary = {
      totalUsers: 1247,
      activeUsers: 892,
      totalCourses: 24,
      totalCertificates: 156,
      totalSigns: 1856,
      totalPredictions: 34210,
      totalTranslations: 56780,
      completionRate: 73.5,
      userGrowthPercent: 12.4,
      courseEnrollmentPercent: 8.2,
      predictionGrowthPercent: 23.1,
    };

    const userGrowth = genTimeSeries(days, base * 3, base);
    const dailyActiveUsers = genTimeSeries(days, base * 2, base * 0.5);
    const courseCompletion = genTimeSeries(days, 8, 3);
    const learningProgress = genTimeSeries(days, 65, 15);
    const dictionaryUsage = genTimeSeries(days, base * 1.5, base * 0.4);
    const predictionVolume = genTimeSeries(days, base * 2, base * 0.8);
    const translationVolume = genTimeSeries(days, base * 3, base);
    const quizSuccessRate = genTimeSeries(days, 72, 10);
    const certificateIssuance = genTimeSeries(days, 4, 2);

    const usersByRole: BreakdownItem[] = [
      { label: 'Learner', value: 845, percent: 67.8, color: BREAKDOWN_COLORS[0] },
      { label: 'Instructor', value: 156, percent: 12.5, color: BREAKDOWN_COLORS[1] },
      { label: 'Teacher', value: 112, percent: 9.0, color: BREAKDOWN_COLORS[2] },
      { label: 'Hospital', value: 68, percent: 5.5, color: BREAKDOWN_COLORS[3] },
      { label: 'NGO', value: 42, percent: 3.4, color: BREAKDOWN_COLORS[4] },
      { label: 'Government', value: 24, percent: 1.8, color: BREAKDOWN_COLORS[5] },
    ];

    const usersByCountry: BreakdownItem[] = [
      { label: 'India', value: 520, percent: 41.7, color: BREAKDOWN_COLORS[0] },
      { label: 'USA', value: 210, percent: 16.8, color: BREAKDOWN_COLORS[1] },
      { label: 'UK', value: 145, percent: 11.6, color: BREAKDOWN_COLORS[2] },
      { label: 'Canada', value: 120, percent: 9.6, color: BREAKDOWN_COLORS[3] },
      { label: 'Australia', value: 95, percent: 7.6, color: BREAKDOWN_COLORS[4] },
      { label: 'Germany', value: 85, percent: 6.8, color: BREAKDOWN_COLORS[5] },
      { label: 'Others', value: 72, percent: 5.9, color: BREAKDOWN_COLORS[6] },
    ];

    const usersByDevice: BreakdownItem[] = [
      { label: 'Desktop', value: 580, percent: 46.5, color: BREAKDOWN_COLORS[0] },
      { label: 'Mobile', value: 465, percent: 37.3, color: BREAKDOWN_COLORS[1] },
      { label: 'Tablet', value: 202, percent: 16.2, color: BREAKDOWN_COLORS[2] },
    ];

    const coursesByCategory: BreakdownItem[] = [
      { label: 'Beginner ISL', value: 8, percent: 33.3, color: BREAKDOWN_COLORS[0] },
      { label: 'Intermediate ISL', value: 6, percent: 25.0, color: BREAKDOWN_COLORS[1] },
      { label: 'Advanced ISL', value: 4, percent: 16.7, color: BREAKDOWN_COLORS[2] },
      { label: 'Healthcare', value: 3, percent: 12.5, color: BREAKDOWN_COLORS[3] },
      { label: 'Education', value: 3, percent: 12.5, color: BREAKDOWN_COLORS[4] },
    ];

    const coursesByDifficulty: BreakdownItem[] = [
      { label: 'Beginner', value: 10, percent: 41.7, color: BREAKDOWN_COLORS[0] },
      { label: 'Intermediate', value: 9, percent: 37.5, color: BREAKDOWN_COLORS[1] },
      { label: 'Advanced', value: 5, percent: 20.8, color: BREAKDOWN_COLORS[2] },
    ];

    const dictionaryByCategory: BreakdownItem[] = [
      { label: 'Greetings', value: 320, percent: 17.2, color: BREAKDOWN_COLORS[0] },
      { label: 'Food & Drink', value: 280, percent: 15.1, color: BREAKDOWN_COLORS[1] },
      { label: 'Emotions', value: 256, percent: 13.8, color: BREAKDOWN_COLORS[2] },
      { label: 'Numbers', value: 210, percent: 11.3, color: BREAKDOWN_COLORS[3] },
      { label: 'Family', value: 198, percent: 10.7, color: BREAKDOWN_COLORS[4] },
      { label: 'Travel', value: 175, percent: 9.4, color: BREAKDOWN_COLORS[5] },
      { label: 'Healthcare', value: 156, percent: 8.4, color: BREAKDOWN_COLORS[6] },
      { label: 'Others', value: 261, percent: 14.1, color: BREAKDOWN_COLORS[7] },
    ];

    const predictionsByGesture: BreakdownItem[] = [
      { label: 'Hello', value: 5420, percent: 15.8, color: BREAKDOWN_COLORS[0] },
      { label: 'Thank You', value: 4180, percent: 12.2, color: BREAKDOWN_COLORS[1] },
      { label: 'Yes', value: 3890, percent: 11.4, color: BREAKDOWN_COLORS[2] },
      { label: 'No', value: 3650, percent: 10.7, color: BREAKDOWN_COLORS[3] },
      { label: 'Help', value: 2980, percent: 8.7, color: BREAKDOWN_COLORS[4] },
      { label: 'Please', value: 2750, percent: 8.0, color: BREAKDOWN_COLORS[5] },
      { label: 'Good Morning', value: 2340, percent: 6.8, color: BREAKDOWN_COLORS[6] },
      { label: 'Others', value: 9000, percent: 26.4, color: BREAKDOWN_COLORS[7] },
    ];

    const topCourses: TopListItem[] = [
      { rank: 1, name: 'Introduction to ISL', value: 342, subtitle: 'Beginner' },
      { rank: 2, name: 'ISL for Healthcare', value: 256, subtitle: 'Intermediate' },
      { rank: 3, name: 'Daily Conversations', value: 198, subtitle: 'Beginner' },
      { rank: 4, name: 'Advanced ISL Grammar', value: 145, subtitle: 'Advanced' },
      { rank: 5, name: 'ISL for Teachers', value: 112, subtitle: 'Intermediate' },
    ];

    const topSigns: TopListItem[] = [
      { rank: 1, name: 'Hello', value: 5420, subtitle: 'Greetings' },
      { rank: 2, name: 'Thank You', value: 4180, subtitle: 'Greetings' },
      { rank: 3, name: 'Yes', value: 3890, subtitle: 'Common' },
      { rank: 4, name: 'Help', value: 2980, subtitle: 'Emergency' },
      { rank: 5, name: 'Water', value: 2150, subtitle: 'Food & Drink' },
    ];

    const topLearners: TopListItem[] = [
      { rank: 1, name: 'Alice M.', value: 95, subtitle: '12 certificates' },
      { rank: 2, name: 'Bob K.', value: 88, subtitle: '9 certificates' },
      { rank: 3, name: 'Diana R.', value: 82, subtitle: '8 certificates' },
      { rank: 4, name: 'Charlie D.', value: 76, subtitle: '7 certificates' },
      { rank: 5, name: 'Eve S.', value: 71, subtitle: '6 certificates' },
    ];

    const mostActiveUsers: TopListItem[] = [
      { rank: 1, name: 'Alice M.', value: 142, subtitle: '142 sessions this month' },
      { rank: 2, name: 'Hank P.', value: 128, subtitle: '128 sessions this month' },
      { rank: 3, name: 'Grace L.', value: 115, subtitle: '115 sessions this month' },
      { rank: 4, name: 'Frank T.', value: 98, subtitle: '98 sessions this month' },
      { rank: 5, name: 'Bob K.', value: 87, subtitle: '87 sessions this month' },
    ];

    return {
      summary,
      userGrowth,
      dailyActiveUsers,
      courseCompletion,
      learningProgress,
      dictionaryUsage,
      predictionVolume,
      translationVolume,
      quizSuccessRate,
      certificateIssuance,
      usersByRole,
      usersByCountry,
      usersByDevice,
      coursesByCategory,
      coursesByDifficulty,
      dictionaryByCategory,
      predictionsByGesture,
      topCourses,
      topSigns,
      topLearners,
      mostActiveUsers,
    };
  },

  async exportData(format: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    // TODO: Backend needs export endpoints
    return { success: false, message: `Export to ${format} requires backend endpoints that are not yet implemented.` };
  },
};
