# SignBridge AI - Entity Relationship Summary

## Overview
This document summarizes the complete database schema for SignBridge AI, including all entities, relationships, and key constraints.

## Enums (9)

| Enum | Values |
|------|--------|
| UserRole | LEARNER, TEACHER, HOSPITAL, NGO, GOVERNMENT, ADMIN |
| OrganizationType | SCHOOL, COLLEGE, NGO, HOSPITAL, GOVERNMENT, COMPANY |
| CourseDifficulty | BEGINNER, INTERMEDIATE, ADVANCED |
| CourseStatus | DRAFT, PUBLISHED, ARCHIVED |
| TranslationType | TEXT_TO_SIGN, SPEECH_TO_SIGN, SIGN_TO_TEXT |
| TranslationStatus | ACTIVE, COMPLETED, CANCELLED |
| NotificationType | COURSE, AI, ACHIEVEMENT, ANNOUNCEMENT, REMINDER |
| FileProvider | CLOUDINARY, AWS_S3 |
| Gender | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |

## Models (26)

### Identity & Access (3)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **Role** | id, name (UserRole enum) | has many Users |
| **User** | id, email, firebaseUid, firstName, lastName | belongs to Role, belongs to Organization (optional), has many Progress, PracticeSessions, Notifications, TranslationSessions, Certificates, QuizAttempts, FavoriteSigns, Files, AuditLogs, ActivityLogs |
| **Organization** | id, name, type, email | has many Users |

### Learning (4)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **Course** | id, title, slug, difficulty, status | has many Modules, Quizzes, Certificates |
| **Module** | id, title, order | belongs to Course, has many Lessons |
| **Lesson** | id, title, videoUrl, duration, order | belongs to Module, has many Progress, PracticeSessions |
| **LessonContent** | (included in Lesson model via videoUrl) | |

### Quiz System (3)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **Quiz** | id, title, timeLimit, passingScore | belongs to Course, has many Questions, Attempts |
| **Question** | id, text, order | belongs to Quiz, has many AnswerOptions |
| **AnswerOption** | id, text, isCorrect, order | belongs to Question |

### Progress & Assessment (3)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **UserProgress** | id, completed, watchTime, accuracy | belongs to User, belongs to Lesson (unique: userId+lessonId) |
| **QuizAttempt** | id, score, totalQuestions, correctAnswers | belongs to User, belongs to Quiz |
| **Certificate** | id, certificateNumber, verificationCode | belongs to User, belongs to Course |

### AI Practice (2)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **PracticeSession** | id, confidenceScore, accuracy, feedback | belongs to User, belongs to Lesson (optional), has many GesturePredictions |
| **GesturePrediction** | id, predictedGesture, confidence, processingTime | belongs to PracticeSession |

### Translation (2)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **TranslationSession** | id, type, status | belongs to User, has many Messages |
| **TranslationMessage** | id, inputText, outputText, confidence | belongs to TranslationSession |

### Dictionary (3)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **SignCategory** | id, name | has many SignWords |
| **SignWord** | id, word, meaning, videoUrl | belongs to SignCategory, has many Favorites |
| **FavoriteSign** | id | belongs to User, belongs to SignWord (unique: userId+signId) |

### Communication (3)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **Notification** | id, title, message, type, isRead | belongs to User |
| **Announcement** | id, title, content, isActive | belongs to User (author) |
| **ContactMessage** | id, name, email, message, isRead | belongs to User (optional) |

### File Storage (1)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **File** | id, fileName, url, mimeType, size, provider | belongs to User (owner) |

### Administration (3)
| Model | Key Fields | Relationships |
|-------|------------|---------------|
| **AuditLog** | id, action, resource, resourceId, ipAddress | belongs to User |
| **SystemSetting** | id, key, value | (standalone) |
| **ActivityLog** | id, action, details, ipAddress | belongs to User |

## Key Relationships

### One-to-Many
- Role → Users
- Organization → Users
- Course → Modules → Lessons
- Course → Quizzes → Questions → AnswerOptions
- Course → Certificates
- User → UserProgress
- User → QuizAttempts
- User → PracticeSessions → GesturePredictions
- User → TranslationSessions → TranslationMessages
- User → Notifications
- User → FavoriteSigns
- User → Files
- User → AuditLogs
- User → ActivityLogs
- SignCategory → SignWords → FavoriteSigns

### Many-to-One
- User → Role (required)
- User → Organization (optional)
- Module → Course (cascade delete)
- Lesson → Module (cascade delete)
- Quiz → Course (cascade delete)
- Question → Quiz (cascade delete)
- AnswerOption → Question (cascade delete)
- UserProgress → User + Lesson (unique constraint)
- QuizAttempt → User + Quiz
- Certificate → User + Course
- PracticeSession → User + Lesson (optional)
- GesturePrediction → PracticeSession (cascade delete)
- TranslationSession → User
- TranslationMessage → TranslationSession (cascade delete)
- SignWord → SignCategory
- FavoriteSign → User + SignWord (unique constraint)
- Notification → User
- Announcement → User
- ContactMessage → User (optional)
- File → User
- AuditLog → User
- ActivityLog → User

## Indexes Summary

### Primary Keys
- All models have UUID primary keys with `@default(uuid())`

### Unique Constraints
- Role.name
- User.email
- User.firebaseUid
- Course.slug
- UserProgress.(userId, lessonId)
- Certificate.certificateNumber
- Certificate.verificationCode
- FavoriteSign.(userId, signId)
- SignCategory.name
- SystemSetting.key

### Performance Indexes
- User: roleId, organizationId, createdAt
- Course: slug, difficulty, status, createdAt
- Module: courseId, order
- Lesson: moduleId, order
- Quiz: courseId
- Question: quizId
- AnswerOption: questionId
- UserProgress: userId, lessonId
- QuizAttempt: userId, quizId, createdAt
- Certificate: userId, courseId, certificateNumber, verificationCode
- PracticeSession: userId, lessonId, createdAt
- GesturePrediction: practiceSessionId, createdAt
- TranslationSession: userId, type, startedAt
- TranslationMessage: sessionId, createdAt
- SignWord: categoryId, word, difficulty
- FavoriteSign: userId, signId
- Notification: userId, type, isRead, createdAt
- Announcement: authorId, isActive, publishedAt
- ContactMessage: userId, isRead, createdAt
- File: ownerId, uploadedAt
- AuditLog: userId, action, resource, createdAt
- ActivityLog: userId, action, createdAt

## Cascade Delete Rules
- Course → Modules, Quizzes (cascade)
- Module → Lessons (cascade)
- Quiz → Questions, Attempts (cascade)
- Question → AnswerOptions (cascade)
- PracticeSession → GesturePredictions (cascade)
- TranslationSession → TranslationMessages (cascade)
- SignWord → Favorites (cascade)
- User → Organization (set null)
- Lesson → PracticeSession (set null)
- ContactMessage → User (set null)

## Seed Data Summary
- 6 roles (all UserRole enum values)
- 2 organizations (school, NGO)
- 4 users (admin, 2 learners, 1 teacher)
- 3 sign categories with 7 sign words
- 2 courses with 3 modules and 6 lessons
- 1 quiz with 1 question and 3 answer options
- 3 user progress records
- 1 practice session with 2 gesture predictions
- 2 favorite signs
- 2 notifications
- 2 system settings
