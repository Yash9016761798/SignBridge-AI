export type CourseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: CourseDifficulty;
  thumbnail: string | null;
  estimatedDuration: number | null;
  status: CourseStatus;
  moduleCount: number;
  quizCount: number;
  enrollmentCount: number;
  createdAt: string;
}

export interface CourseDetail extends CourseListItem {
  modules: Module[];
  quizzes: Quiz[];
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  duration: number | null;
  order: number;
}

export interface LessonDetail extends Lesson {
  module: {
    id: string;
    title: string;
    course: { id: string; title: string };
  };
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  order: number;
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number | null;
  answers: Record<string, string> | null;
  passed?: boolean;
  passingScore?: number;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  status: string;
  course: CourseListItem & { moduleCount: number };
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  modules: ProgressModule[];
}

export interface ProgressModule {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: ProgressLesson[];
}

export interface ProgressLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  completed: boolean;
  watchTime: number;
  accuracy: number | null;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  issuedDate: string;
  verificationCode: string;
  pdfUrl: string | null;
  course: { title: string; difficulty: CourseDifficulty };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
