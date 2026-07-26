import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto/course.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { CreateQuizDto, SubmitQuizAttemptDto } from './dto/quiz.dto';
import { UpdateProgressDto } from './dto/progress.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // COURSES
  // ===========================================================================

  async findAllCourses(query: QueryCourseDto) {
    const { search, difficulty, status, page = 1, limit = 20 } = query;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          _count: { select: { modules: true, quizzes: true, enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: items.map((c) => ({
        ...c,
        moduleCount: c._count.modules,
        quizCount: c._count.quizzes,
        enrollmentCount: c._count.enrollments,
        _count: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: { include: { lessons: true }, orderBy: { order: 'asc' } },
        quizzes: { include: { questions: { include: { answerOptions: true } } } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return { ...course, enrollmentCount: course._count.enrollments, _count: undefined };
  }

  async createCourse(dto: CreateCourseDto) {
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const existing = await this.prisma.course.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Course with this slug already exists');

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        difficulty: (dto.difficulty as any) || 'BEGINNER',
        thumbnail: dto.thumbnail,
        estimatedDuration: dto.estimatedDuration,
      },
    });
    this.logger.log(`Created course: ${course.title}`);
    return course;
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Course not found');

    const course = await this.prisma.course.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty as any,
        thumbnail: dto.thumbnail,
        estimatedDuration: dto.estimatedDuration,
        status: dto.status as any,
      },
    });
    this.logger.log(`Updated course: ${course.title}`);
    return course;
  }

  async deleteCourse(id: string) {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Course not found');
    await this.prisma.course.delete({ where: { id } });
    this.logger.log(`Deleted course: ${id}`);
  }

  // ===========================================================================
  // ENROLLMENTS
  // ===========================================================================

  async enrollInCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    const enrollment = await this.prisma.enrollment.create({
      data: { userId, courseId },
    });
    this.logger.log(`User ${userId} enrolled in course ${courseId}`);
    return enrollment;
  }

  async unenrollFromCourse(userId: string, courseId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!existing) throw new NotFoundException('Enrollment not found');

    await this.prisma.enrollment.delete({ where: { id: existing.id } });
    this.logger.log(`User ${userId} unenrolled from course ${courseId}`);
  }

  async getUserEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => ({
      ...e,
      course: {
        ...e.course,
        moduleCount: e.course._count.modules,
        _count: undefined,
      },
    }));
  }

  // ===========================================================================
  // MODULES
  // ===========================================================================

  async createModule(dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const module = await this.prisma.module.create({
      data: {
        title: dto.title,
        description: dto.description,
        order: dto.order,
        courseId: dto.courseId,
      },
    });
    this.logger.log(`Created module: ${module.title}`);
    return module;
  }

  async updateModule(id: string, dto: UpdateModuleDto) {
    const existing = await this.prisma.module.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Module not found');

    const module = await this.prisma.module.update({
      where: { id },
      data: { title: dto.title, description: dto.description, order: dto.order },
    });
    this.logger.log(`Updated module: ${module.title}`);
    return module;
  }

  async deleteModule(id: string) {
    const existing = await this.prisma.module.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Module not found');
    await this.prisma.module.delete({ where: { id } });
    this.logger.log(`Deleted module: ${id}`);
  }

  // ===========================================================================
  // LESSONS
  // ===========================================================================

  async createLesson(dto: CreateLessonDto) {
    const module = await this.prisma.module.findUnique({ where: { id: dto.moduleId } });
    if (!module) throw new NotFoundException('Module not found');

    const lesson = await this.prisma.lesson.create({
      data: {
        title: dto.title,
        description: dto.description,
        videoUrl: dto.videoUrl,
        thumbnail: dto.thumbnail,
        duration: dto.duration,
        order: dto.order,
        moduleId: dto.moduleId,
      },
    });
    this.logger.log(`Created lesson: ${lesson.title}`);
    return lesson;
  }

  async findLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lesson not found');

    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        videoUrl: dto.videoUrl,
        thumbnail: dto.thumbnail,
        duration: dto.duration,
        order: dto.order,
      },
    });
    this.logger.log(`Updated lesson: ${lesson.title}`);
    return lesson;
  }

  async deleteLesson(id: string) {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lesson not found');
    await this.prisma.lesson.delete({ where: { id } });
    this.logger.log(`Deleted lesson: ${id}`);
  }

  // ===========================================================================
  // PROGRESS
  // ===========================================================================

  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: dto.lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const progress = await this.prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: dto.lessonId } },
      create: {
        userId,
        lessonId: dto.lessonId,
        completed: dto.completed || false,
        watchTime: dto.watchTime || 0,
        accuracy: dto.accuracy,
        completionDate: dto.completed ? new Date() : undefined,
      },
      update: {
        completed: dto.completed,
        watchTime: dto.watchTime,
        accuracy: dto.accuracy,
        completionDate: dto.completed ? new Date() : undefined,
      },
    });

    this.logger.log(`Updated progress for user ${userId}, lesson ${dto.lessonId}`);
    return progress;
  }

  async getUserProgress(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: { where: { userId } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    let totalLessons = 0;
    let completedLessons = 0;

    const modules = course.modules.map((mod) => {
      const lessons = mod.lessons.map((lesson) => {
        totalLessons++;
        const prog = lesson.progress[0];
        if (prog?.completed) completedLessons++;
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: lesson.order,
          completed: prog?.completed || false,
          watchTime: prog?.watchTime || 0,
          accuracy: prog?.accuracy || null,
        };
      });
      return {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        lessons,
      };
    });

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalLessons,
      completedLessons,
      progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      modules,
    };
  }

  // ===========================================================================
  // QUIZZES
  // ===========================================================================

  async createQuiz(dto: CreateQuizDto) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        description: dto.description,
        timeLimit: dto.timeLimit,
        passingScore: dto.passingScore || 70,
        courseId: dto.courseId,
        questions: dto.questions
          ? {
              create: dto.questions.map((q) => ({
                text: q.text,
                order: q.order,
                answerOptions: { create: q.answerOptions },
              })),
            }
          : undefined,
      },
      include: { questions: { include: { answerOptions: true } } },
    });
    this.logger.log(`Created quiz: ${quiz.title}`);
    return quiz;
  }

  async findQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: { include: { answerOptions: true }, orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async submitQuizAttempt(userId: string, dto: SubmitQuizAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: { questions: { include: { answerOptions: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    for (const question of quiz.questions) {
      const selectedAnswerId = dto.answers[question.id];
      if (selectedAnswerId) {
        const correctOption = question.answerOptions.find((o) => o.isCorrect);
        if (correctOption && correctOption.id === selectedAnswerId) {
          correctAnswers++;
        }
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId: dto.quizId,
        score,
        totalQuestions,
        correctAnswers,
        timeTaken: dto.timeTaken,
        answers: dto.answers,
      },
    });

    this.logger.log(`Quiz attempt by user ${userId}: score ${score}%`);
    return { ...attempt, passed: score >= quiz.passingScore, passingScore: quiz.passingScore };
  }

  async getUserQuizAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===========================================================================
  // CERTIFICATES
  // ===========================================================================

  async issueCertificate(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Must be enrolled to receive certificate');

    const existing = await this.prisma.certificate.findFirst({
      where: { userId, courseId },
    });
    if (existing) return existing;

    const certNumber = `SB-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const verificationCode = randomBytes(8).toString('hex').toUpperCase();

    const certificate = await this.prisma.certificate.create({
      data: { userId, courseId, certificateNumber: certNumber, verificationCode },
      include: { course: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.logger.log(`Issued certificate ${certNumber} to user ${userId}`);
    return certificate;
  }

  async verifyCertificate(verificationCode: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: { course: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    return certificate;
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true, difficulty: true } } },
      orderBy: { issuedDate: 'desc' },
    });
  }
}
