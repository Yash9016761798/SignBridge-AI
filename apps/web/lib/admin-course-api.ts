import { learningApi } from './learning-api';
import apiClient from './api';
import type {
  AdminCourseListItem,
  AdminCourseDetail,
  AdminCourseQueryParams,
  AdminCourseStats,
  AdminModule,
  AdminLesson,
} from '@/types/admin-course';

// TODO: Backend needs these admin-specific endpoints:
// - GET    /api/v1/admin/courses           (list all courses with enrollment counts, completion rates)
// - GET    /api/v1/admin/courses/:id       (course detail with modules/lessons for admin)
// - POST   /api/v1/admin/courses/:id/duplicate  (duplicate a course)
// - PATCH  /api/v1/admin/courses/:id/status     (publish/unpublish/archive)
// - GET    /api/v1/admin/stats/courses     (course stats)
// Currently reusing existing learning API + mock adapter for missing operations.

const MOCK_COURSES: AdminCourseListItem[] = [
  { id: 'c1', title: 'ISL Fundamentals', slug: 'isl-fundamentals', description: 'Learn the basics of Indian Sign Language including alphabet, numbers, and common greetings.', difficulty: 'BEGINNER', thumbnail: null, estimatedDuration: 120, status: 'PUBLISHED', moduleCount: 4, lessonCount: 16, enrollmentCount: 234, completionRate: 68, instructorName: 'Rahul Patel', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString() },
  { id: 'c2', title: 'Daily Conversations in ISL', slug: 'daily-conversations', description: 'Practice everyday conversations like introductions, asking for directions, and shopping.', difficulty: 'BEGINNER', thumbnail: null, estimatedDuration: 180, status: 'PUBLISHED', moduleCount: 5, lessonCount: 20, enrollmentCount: 189, completionRate: 54, instructorName: 'Priya Sharma', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString() },
  { id: 'c3', title: 'Advanced ISL Grammar', slug: 'advanced-grammar', description: 'Master complex sentence structures, classifiers, and spatial grammar in ISL.', difficulty: 'ADVANCED', thumbnail: null, estimatedDuration: 240, status: 'PUBLISHED', moduleCount: 6, lessonCount: 24, enrollmentCount: 87, completionRate: 42, instructorName: 'Vikram Singh', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString() },
  { id: 'c4', title: 'Medical Sign Language', slug: 'medical-sign-language', description: 'Essential signs for healthcare settings including patient communication and emergency terms.', difficulty: 'INTERMEDIATE', thumbnail: null, estimatedDuration: 150, status: 'DRAFT', moduleCount: 3, lessonCount: 12, enrollmentCount: 0, completionRate: 0, instructorName: 'Anita Desai', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: 'c5', title: 'Numbers & Counting in ISL', slug: 'numbers-counting', description: 'Learn to sign numbers, fractions, and mathematical operations in ISL.', difficulty: 'BEGINNER', thumbnail: null, estimatedDuration: 60, status: 'PUBLISHED', moduleCount: 2, lessonCount: 8, enrollmentCount: 156, completionRate: 82, instructorName: 'Rahul Patel', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() },
  { id: 'c6', title: 'Family & Relationships in ISL', slug: 'family-relationships', description: 'Signs for family members, relationships, and social interactions.', difficulty: 'BEGINNER', thumbnail: null, estimatedDuration: 90, status: 'ARCHIVED', moduleCount: 3, lessonCount: 10, enrollmentCount: 67, completionRate: 71, instructorName: 'Priya Sharma', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString() },
  { id: 'c7', title: 'Workplace Communication in ISL', slug: 'workplace-communication', description: 'Professional signs for office settings, meetings, and workplace safety.', difficulty: 'INTERMEDIATE', thumbnail: null, estimatedDuration: 200, status: 'PUBLISHED', moduleCount: 5, lessonCount: 18, enrollmentCount: 98, completionRate: 45, instructorName: 'Vikram Singh', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString() },
  { id: 'c8', title: 'Intermediate ISL Vocabulary', slug: 'intermediate-vocabulary', description: 'Expand your ISL vocabulary with advanced signs for emotions, abstract concepts, and idioms.', difficulty: 'INTERMEDIATE', thumbnail: null, estimatedDuration: 160, status: 'DRAFT', moduleCount: 4, lessonCount: 14, enrollmentCount: 0, completionRate: 0, instructorName: 'Anita Desai', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
];

const MOCK_DETAILS: Record<string, AdminCourseDetail> = {
  c1: {
    ...MOCK_COURSES[0],
    modules: [
      { id: 'm1', title: 'Introduction to ISL', description: 'What is ISL and why it matters', order: 1, lessons: [
        { id: 'l1', title: 'History of ISL', description: 'Origins and evolution', videoUrl: null, duration: 300, order: 1 },
        { id: 'l2', title: 'ISL Alphabet', description: 'Fingerspelling basics', videoUrl: null, duration: 600, order: 2 },
        { id: 'l3', title: 'Practice: Spell Your Name', description: 'Interactive exercise', videoUrl: null, duration: 450, order: 3 },
      ]},
      { id: 'm2', title: 'Common Greetings', description: 'Everyday greetings and introductions', order: 2, lessons: [
        { id: 'l4', title: 'Hello & Goodbye', description: 'Basic greetings', videoUrl: null, duration: 240, order: 1 },
        { id: 'l5', title: 'Introducing Yourself', description: 'Name, age, and occupation', videoUrl: null, duration: 360, order: 2 },
      ]},
      { id: 'm3', title: 'Numbers & Counting', description: 'Signing numbers 1-100', order: 3, lessons: [
        { id: 'l6', title: 'Numbers 1-20', description: 'Basic number signs', videoUrl: null, duration: 300, order: 1 },
        { id: 'l7', title: 'Numbers 21-100', description: 'Extended number signs', videoUrl: null, duration: 300, order: 2 },
      ]},
    ],
    quizzes: [{ id: 'q1', title: 'ISL Basics Quiz', questions: [{ id: 'qn1' }, { id: 'qn2' }, { id: 'qn3' }] }],
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const adminCourseApi = {
  async getCourses(params: AdminCourseQueryParams = {}): Promise<{ data: AdminCourseListItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    await delay(300);
    let filtered = [...MOCK_COURSES];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (params.difficulty) {
      filtered = filtered.filter((c) => c.difficulty === params.difficulty);
    }
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated,
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    };
  },

  async getCourseById(id: string): Promise<AdminCourseDetail> {
    await delay(200);
    if (MOCK_DETAILS[id]) return MOCK_DETAILS[id];
    const course = MOCK_COURSES.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    return { ...course, modules: [], quizzes: [] };
  },

  async createCourse(data: { title: string; description?: string; difficulty?: string; estimatedDuration?: number; status?: string }): Promise<AdminCourseListItem> {
    // TODO: Replace with real API: POST /api/v1/learning/courses
    await delay(400);
    const newCourse: AdminCourseListItem = {
      id: `c${Date.now()}`,
      title: data.title,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: data.description || null,
      difficulty: (data.difficulty as any) || 'BEGINNER',
      thumbnail: null,
      estimatedDuration: data.estimatedDuration || null,
      status: (data.status as any) || 'DRAFT',
      moduleCount: 0,
      lessonCount: 0,
      enrollmentCount: 0,
      completionRate: 0,
      instructorName: 'Admin',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    MOCK_COURSES.unshift(newCourse);
    return newCourse;
  },

  async updateCourse(id: string, data: Partial<Pick<AdminCourseListItem, 'title' | 'description' | 'difficulty' | 'estimatedDuration' | 'status'>>): Promise<AdminCourseListItem> {
    // TODO: Replace with real API: PUT /api/v1/learning/courses/:id
    await delay(400);
    const idx = MOCK_COURSES.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Course not found');
    MOCK_COURSES[idx] = { ...MOCK_COURSES[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_COURSES[idx];
  },

  async deleteCourse(id: string): Promise<void> {
    // TODO: Replace with real API: DELETE /api/v1/learning/courses/:id
    await delay(300);
    const idx = MOCK_COURSES.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Course not found');
    MOCK_COURSES.splice(idx, 1);
  },

  async publishCourse(id: string): Promise<AdminCourseListItem> {
    // TODO: Replace with real API: PATCH /api/v1/admin/courses/:id/status
    return this.updateCourse(id, { status: 'PUBLISHED' });
  },

  async unpublishCourse(id: string): Promise<AdminCourseListItem> {
    // TODO: Replace with real API: PATCH /api/v1/admin/courses/:id/status
    return this.updateCourse(id, { status: 'DRAFT' });
  },

  async archiveCourse(id: string): Promise<AdminCourseListItem> {
    // TODO: Replace with real API: PATCH /api/v1/admin/courses/:id/status
    return this.updateCourse(id, { status: 'ARCHIVED' });
  },

  async duplicateCourse(id: string): Promise<AdminCourseListItem> {
    // TODO: Replace with real API: POST /api/v1/admin/courses/:id/duplicate
    await delay(500);
    const original = MOCK_COURSES.find((c) => c.id === id);
    if (!original) throw new Error('Course not found');
    const duplicate: AdminCourseListItem = {
      ...original,
      id: `c${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      status: 'DRAFT',
      enrollmentCount: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_COURSES.unshift(duplicate);
    return duplicate;
  },

  async createModule(data: { title: string; description?: string; order: number; courseId: string }): Promise<AdminModule> {
    // TODO: Replace with real API: POST /api/v1/learning/modules
    await delay(300);
    return { id: `m${Date.now()}`, title: data.title, description: data.description || null, order: data.order, lessons: [] };
  },

  async updateModule(id: string, data: Partial<Pick<AdminModule, 'title' | 'description' | 'order'>>): Promise<AdminModule> {
    // TODO: Replace with real API: PUT /api/v1/learning/modules/:id
    await delay(300);
    return { id, title: data.title || '', description: data.description || null, order: data.order || 1, lessons: [] };
  },

  async deleteModule(id: string): Promise<void> {
    // TODO: Replace with real API: DELETE /api/v1/learning/modules/:id
    await delay(200);
  },

  async createLesson(data: { title: string; description?: string; duration?: number; order: number; moduleId: string }): Promise<AdminLesson> {
    // TODO: Replace with real API: POST /api/v1/learning/lessons
    await delay(300);
    return { id: `l${Date.now()}`, title: data.title, description: data.description || null, videoUrl: null, duration: data.duration || null, order: data.order };
  },

  async updateLesson(id: string, data: Partial<Pick<AdminLesson, 'title' | 'description' | 'duration' | 'order'>>): Promise<AdminLesson> {
    // TODO: Replace with real API: PUT /api/v1/learning/lessons/:id
    await delay(300);
    return { id, title: data.title || '', description: data.description || null, videoUrl: null, duration: data.duration || null, order: data.order || 1 };
  },

  async deleteLesson(id: string): Promise<void> {
    // TODO: Replace with real API: DELETE /api/v1/learning/lessons/:id
    await delay(200);
  },

  async getStats(): Promise<AdminCourseStats> {
    // TODO: Replace with real API: GET /api/v1/admin/stats/courses
    await delay(200);
    return {
      totalCourses: MOCK_COURSES.length,
      publishedCourses: MOCK_COURSES.filter((c) => c.status === 'PUBLISHED').length,
      draftCourses: MOCK_COURSES.filter((c) => c.status === 'DRAFT').length,
      archivedCourses: MOCK_COURSES.filter((c) => c.status === 'ARCHIVED').length,
      totalEnrollments: MOCK_COURSES.reduce((sum, c) => sum + c.enrollmentCount, 0),
      avgCompletionRate: Math.round(MOCK_COURSES.filter((c) => c.completionRate > 0).reduce((sum, c) => sum + c.completionRate, 0) / MOCK_COURSES.filter((c) => c.completionRate > 0).length),
    };
  },
};
