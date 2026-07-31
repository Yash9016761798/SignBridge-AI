import type { CourseDifficulty, CourseStatus } from './learning';

export type { CourseDifficulty, CourseStatus };

export interface AdminCourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: CourseDifficulty;
  thumbnail: string | null;
  estimatedDuration: number | null;
  status: CourseStatus;
  moduleCount: number;
  lessonCount: number;
  enrollmentCount: number;
  completionRate: number;
  instructorName: string;
  updatedAt: string;
  createdAt: string;
}

export interface AdminCourseDetail extends AdminCourseListItem {
  modules: AdminModule[];
  quizzes: { id: string; title: string; questions: { id: string }[] }[];
}

export interface AdminModule {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: AdminLesson[];
}

export interface AdminLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
}

export interface AdminCourseQueryParams {
  search?: string;
  difficulty?: CourseDifficulty;
  status?: CourseStatus;
  page?: number;
  limit?: number;
}

export interface AdminCourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  avgCompletionRate: number;
}
