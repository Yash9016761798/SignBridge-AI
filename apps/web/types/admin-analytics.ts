export type TimeRange = 'today' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalCertificates: number;
  totalSigns: number;
  totalPredictions: number;
  totalTranslations: number;
  completionRate: number;
  userGrowthPercent: number;
  courseEnrollmentPercent: number;
  predictionGrowthPercent: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface MultiSeriesDataPoint {
  label: string;
  series: { name: string; value: number }[];
}

export interface BreakdownItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface TopListItem {
  rank: number;
  name: string;
  value: number;
  subtitle?: string;
  trend?: number;
}

export interface AnalyticsDashboard {
  summary: AnalyticsSummary;
  userGrowth: ChartDataPoint[];
  dailyActiveUsers: ChartDataPoint[];
  courseCompletion: ChartDataPoint[];
  learningProgress: ChartDataPoint[];
  dictionaryUsage: ChartDataPoint[];
  predictionVolume: ChartDataPoint[];
  translationVolume: ChartDataPoint[];
  quizSuccessRate: ChartDataPoint[];
  certificateIssuance: ChartDataPoint[];
  usersByRole: BreakdownItem[];
  usersByCountry: BreakdownItem[];
  usersByDevice: BreakdownItem[];
  coursesByCategory: BreakdownItem[];
  coursesByDifficulty: BreakdownItem[];
  dictionaryByCategory: BreakdownItem[];
  predictionsByGesture: BreakdownItem[];
  topCourses: TopListItem[];
  topSigns: TopListItem[];
  topLearners: TopListItem[];
  mostActiveUsers: TopListItem[];
}

export interface ExportOption {
  format: 'csv' | 'excel' | 'pdf';
  label: string;
  available: boolean;
}
