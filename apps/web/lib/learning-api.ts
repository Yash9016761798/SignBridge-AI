import apiClient from './api';
import type {
  CourseListItem,
  CourseDetail,
  LessonDetail,
  Quiz,
  QuizAttempt,
  Enrollment,
  CourseProgress,
  Certificate,
  PaginatedResponse,
} from '@/types/learning';

export interface CourseQueryParams {
  search?: string;
  difficulty?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const learningApi = {
  async getCourses(params: CourseQueryParams = {}): Promise<PaginatedResponse<CourseListItem>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) searchParams.set(key, String(value));
    });
    const qs = searchParams.toString();
    return apiClient.get(`/learning/courses${qs ? `?${qs}` : ''}`);
  },

  async getCourseById(id: string): Promise<CourseDetail> {
    return apiClient.get(`/learning/courses/${id}`);
  },

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    return apiClient.post(`/learning/courses/${courseId}/enroll`);
  },

  async unenrollFromCourse(courseId: string): Promise<void> {
    return apiClient.delete(`/learning/courses/${courseId}/enroll`);
  },

  async getMyEnrollments(): Promise<Enrollment[]> {
    return apiClient.get('/learning/my-courses');
  },

  async getLessonById(id: string): Promise<LessonDetail> {
    return apiClient.get(`/learning/lessons/${id}`);
  },

  async updateProgress(data: { lessonId: string; completed?: boolean; watchTime?: number; accuracy?: number }) {
    return apiClient.post('/learning/progress', data);
  },

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    return apiClient.get(`/learning/courses/${courseId}/progress`);
  },

  async getQuizById(id: string): Promise<Quiz> {
    return apiClient.get(`/learning/quizzes/${id}`);
  },

  async submitQuizAttempt(data: { quizId: string; timeTaken?: number; answers: Record<string, string> }): Promise<QuizAttempt> {
    return apiClient.post('/learning/quizzes/attempt', data);
  },

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    return apiClient.get(`/learning/quizzes/${quizId}/attempts`);
  },

  async issueCertificate(courseId: string): Promise<Certificate> {
    return apiClient.post(`/learning/courses/${courseId}/certificate`);
  },

  async getMyCertificates(): Promise<Certificate[]> {
    return apiClient.get('/learning/my-certificates');
  },

  async verifyCertificate(code: string): Promise<Certificate> {
    return apiClient.get(`/learning/certificates/verify/${code}`);
  },
};
