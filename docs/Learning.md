# Learning Module

## Overview

The Learning module provides the core educational experience: courses, modules, lessons, quizzes, progress tracking, enrollment, and certificates.

## Architecture

### Backend

**Module:** `apps/backend/src/learning/`

| File | Purpose |
|---|---|
| `learning.module.ts` | NestJS module registration |
| `learning.controller.ts` | REST endpoints with Swagger docs (20+ endpoints) |
| `learning.service.ts` | Business logic for courses, enrollment, lessons, progress, quizzes, certificates |
| `dto/course.dto.ts` | Create/Update/Query course validation |
| `dto/module.dto.ts` | Create/Update module validation |
| `dto/lesson.dto.ts` | Create/Update lesson validation |
| `dto/quiz.dto.ts` | Create quiz, questions, answers, submit attempt |
| `dto/progress.dto.ts` | Update lesson progress validation |

### Frontend

**Pages:** `apps/web/app/(dashboard)/`

| Route | File | Purpose |
|---|---|---|
| `/learn` | `learn/page.tsx` | Course listing with search & filters |
| `/learn/[id]` | `learn/[id]/page.tsx` | Course detail with modules, lessons, quizzes |
| `/learn/[id]/lessons/[lessonId]` | `learn/[id]/lessons/[lessonId]/page.tsx` | Lesson viewer with video & mark-complete |
| `/learn/[id]/quiz/[quizId]` | `learn/[id]/quiz/[quizId]/page.tsx` | Quiz with questions, answers, scoring |
| `/my-courses` | `my-courses/page.tsx` | Enrolled courses list |
| `/certificates` | `certificates/page.tsx` | User certificates with verification |

**Types:** `apps/web/types/learning.ts`
**API Service:** `apps/web/lib/learning-api.ts`

## API Endpoints

### Courses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/learning/courses` | Public | List courses (search, filter by difficulty/status, paginated) |
| GET | `/learning/courses/:id` | Public | Get course detail with modules, lessons, quizzes |
| POST | `/learning/courses` | Admin | Create course |
| PUT | `/learning/courses/:id` | Admin | Update course |
| DELETE | `/learning/courses/:id` | Admin | Delete course |

### Enrollments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/learning/courses/:courseId/enroll` | User | Enroll in course |
| DELETE | `/learning/courses/:courseId/enroll` | User | Unenroll from course |
| GET | `/learning/my-courses` | User | Get enrolled courses |

### Modules & Lessons

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/learning/modules` | Admin | Create module in course |
| PUT | `/learning/modules/:id` | Admin | Update module |
| DELETE | `/learning/modules/:id` | Admin | Delete module |
| GET | `/learning/lessons/:id` | Public | Get lesson detail |
| POST | `/learning/lessons` | Admin | Create lesson in module |
| PUT | `/learning/lessons/:id` | Admin | Update lesson |
| DELETE | `/learning/lessons/:id` | Admin | Delete lesson |

### Progress

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/learning/progress` | User | Update lesson progress (completed, watchTime, accuracy) |
| GET | `/learning/courses/:courseId/progress` | User | Get course progress (per-lesson completion) |

### Quizzes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/learning/quizzes/:id` | Public | Get quiz with questions and answer options |
| POST | `/learning/quizzes` | Admin | Create quiz with questions and answers |
| POST | `/learning/quizzes/attempt` | User | Submit quiz attempt (answers, scoring) |
| GET | `/learning/quizzes/:quizId/attempts` | User | Get user's quiz attempts |

### Certificates

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/learning/courses/:courseId/certificate` | User | Issue certificate (must be enrolled) |
| GET | `/learning/certificates/verify/:code` | Public | Verify certificate by verification code |
| GET | `/learning/my-certificates` | User | Get user's certificates |

## Database Models

- **Course:** id, title, slug (unique), description, difficulty, thumbnail, estimatedDuration, status, createdBy, timestamps
- **Enrollment:** id, enrolledAt, completedAt, status (ACTIVE/COMPLETED/DROPPED), userId, courseId (unique pair)
- **Module:** id, title, description, order, courseId, timestamps
- **Lesson:** id, title, description, videoUrl, thumbnail, duration, order, moduleId, timestamps
- **Quiz:** id, title, description, timeLimit, passingScore, courseId, timestamps
- **Question:** id, text, order, quizId, timestamps
- **AnswerOption:** id, text, isCorrect, order, questionId, timestamps
- **UserProgress:** id, completed, completionDate, watchTime, accuracy, userId, lessonId (unique pair)
- **QuizAttempt:** id, score, totalQuestions, correctAnswers, timeTaken, answers (JSON), userId, quizId, timestamps
- **Certificate:** id, certificateNumber (unique), issuedDate, verificationCode (unique), pdfUrl, userId, courseId, timestamps

## Scoring

Quiz scoring: `score = (correctAnswers / totalQuestions) * 100`. Passing requires `score >= passingScore` (default 70%).

## Certificate Verification

Each certificate has a unique `verificationCode`. The verify endpoint returns full certificate details including course and user info for third-party verification.

## Frontend Features

- **Course Grid:** Card-based course listing with difficulty badges, module count, enrollment count
- **Course Detail:** Full course info, module accordion with lesson list, quiz list
- **Lesson Viewer:** Video player placeholder, description, mark-as-complete button
- **Quiz Interface:** Question-by-question display, answer selection, submit, pass/fail result screen
- **My Courses:** Enrollment list with status badges (Active/Completed)
- **Certificates:** Certificate cards with verification code copy-to-clipboard
