import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto/course.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { CreateQuizDto, SubmitQuizAttemptDto } from './dto/quiz.dto';
import { UpdateProgressDto } from './dto/progress.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // ===========================================================================
  // COURSES
  // ===========================================================================

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses with search, filters, pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of courses' })
  async findAllCourses(@Query() query: QueryCourseDto) {
    return this.learningService.findAllCourses(query);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course detail with modules and quizzes' })
  @ApiResponse({ status: 200, description: 'Course detail' })
  async findCourseById(@Param('id') id: string) {
    return this.learningService.findCourseById(id);
  }

  @Post('courses')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create course (Admin/Teacher)' })
  @ApiResponse({ status: 201, description: 'Course created' })
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.learningService.createCourse(dto);
  }

  @Put('courses/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Update course' })
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.learningService.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete course' })
  async deleteCourse(@Param('id') id: string) {
    return this.learningService.deleteCourse(id);
  }

  // ===========================================================================
  // ENROLLMENTS
  // ===========================================================================

  @Post('courses/:courseId/enroll')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Enroll in a course' })
  async enrollInCourse(@Req() req: any, @Param('courseId') courseId: string) {
    return this.learningService.enrollInCourse(req.user.id, courseId);
  }

  @Delete('courses/:courseId/enroll')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unenroll from a course' })
  async unenrollFromCourse(@Req() req: any, @Param('courseId') courseId: string) {
    return this.learningService.unenrollFromCourse(req.user.id, courseId);
  }

  @Get('my-courses')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get enrolled courses for current user' })
  async getMyEnrollments(@Req() req: any) {
    return this.learningService.getUserEnrollments(req.user.id);
  }

  // ===========================================================================
  // MODULES
  // ===========================================================================

  @Post('modules')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create module in a course' })
  async createModule(@Body() dto: CreateModuleDto) {
    return this.learningService.createModule(dto);
  }

  @Put('modules/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Update module' })
  async updateModule(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.learningService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete module' })
  async deleteModule(@Param('id') id: string) {
    return this.learningService.deleteModule(id);
  }

  // ===========================================================================
  // LESSONS
  // ===========================================================================

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get lesson detail' })
  async findLessonById(@Param('id') id: string) {
    return this.learningService.findLessonById(id);
  }

  @Post('lessons')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create lesson in a module' })
  async createLesson(@Body() dto: CreateLessonDto) {
    return this.learningService.createLesson(dto);
  }

  @Put('lessons/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Update lesson' })
  async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.learningService.updateLesson(id, dto);
  }

  @Delete('lessons/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lesson' })
  async deleteLesson(@Param('id') id: string) {
    return this.learningService.deleteLesson(id);
  }

  // ===========================================================================
  // PROGRESS
  // ===========================================================================

  @Post('progress')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Update lesson progress' })
  async updateProgress(@Req() req: any, @Body() dto: UpdateProgressDto) {
    return this.learningService.updateProgress(req.user.id, dto);
  }

  @Get('courses/:courseId/progress')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get course progress for current user' })
  async getCourseProgress(@Req() req: any, @Param('courseId') courseId: string) {
    return this.learningService.getUserProgress(req.user.id, courseId);
  }

  // ===========================================================================
  // QUIZZES
  // ===========================================================================

  @Get('quizzes/:id')
  @ApiOperation({ summary: 'Get quiz with questions' })
  async findQuizById(@Param('id') id: string) {
    return this.learningService.findQuizById(id);
  }

  @Post('quizzes')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Create quiz for a course' })
  async createQuiz(@Body() dto: CreateQuizDto) {
    return this.learningService.createQuiz(dto);
  }

  @Post('quizzes/attempt')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Submit a quiz attempt' })
  async submitQuizAttempt(@Req() req: any, @Body() dto: SubmitQuizAttemptDto) {
    return this.learningService.submitQuizAttempt(req.user.id, dto);
  }

  @Get('quizzes/:quizId/attempts')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get quiz attempts for current user' })
  async getQuizAttempts(@Req() req: any, @Param('quizId') quizId: string) {
    return this.learningService.getUserQuizAttempts(req.user.id, quizId);
  }

  // ===========================================================================
  // CERTIFICATES
  // ===========================================================================

  @Post('courses/:courseId/certificate')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Issue certificate for completed course' })
  async issueCertificate(@Req() req: any, @Param('courseId') courseId: string) {
    return this.learningService.issueCertificate(req.user.id, courseId);
  }

  @Get('certificates/verify/:code')
  @ApiOperation({ summary: 'Verify a certificate by code' })
  async verifyCertificate(@Param('code') code: string) {
    return this.learningService.verifyCertificate(code);
  }

  @Get('my-certificates')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Get certificates for current user' })
  async getMyCertificates(@Req() req: any) {
    return this.learningService.getUserCertificates(req.user.id);
  }
}
