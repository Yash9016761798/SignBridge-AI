# SIGNBRIDGE AI

## Database Schema & Prisma Model Blueprint

**Version:** 1.0

This document defines the complete database architecture for SignBridge AI.

The database is designed to support:

- Millions of users
- Multiple organizations
- Multi-role authentication
- AI-assisted sign language learning
- Real-time translation history
- Institution management
- Progress tracking
- Analytics
- Future enterprise expansion

The schema must remain normalized, scalable, and maintainable.

---

## 1. DATABASE PRINCIPLES

Every database decision must follow these principles:

- Third Normal Form (3NF) where practical
- Minimize data duplication
- Prefer explicit relationships
- Use UUIDs as primary keys
- Soft delete only where business requirements justify it
- Add timestamps to all business entities
- Enforce referential integrity with foreign keys
- Use meaningful names
- Avoid storing derived values unless justified for performance

---

## 2. DATABASE TECHNOLOGY

| Category           | Technology                 |
| ------------------ | -------------------------- |
| Database Engine    | PostgreSQL (latest stable) |
| ORM                | Prisma                     |
| Migration Tool     | Prisma Migrate             |
| Seeding            | Prisma Seed                |
| Character Encoding | UTF-8                      |
| Timezone           | UTC                        |

---

## 3. NAMING CONVENTIONS

### Tables

- Singular model names in Prisma
- Snake_case table names in PostgreSQL (configured by Prisma if needed)

**Examples:** `User`, `Course`, `Lesson`, `Organization`, `Notification`

### Columns

- Use camelCase in Prisma models

**Examples:** `createdAt`, `updatedAt`, `profileImage`, `firstName`

### Foreign Keys

- Always end with `Id`

**Examples:** `userId`, `courseId`, `lessonId`, `organizationId`

---

## 4. CORE DATABASE ENTITIES

The initial schema should include the following domain models.

### Identity & Access

- User
- Role
- Permission (optional future)
- UserRole (if many-to-many is adopted)
- Session (future)

### Organizations

- Organization
- OrganizationMember

**Organization types:** School, College, NGO, Hospital, Government, Company

### Learning

- Course
- Module
- Lesson
- LessonContent
- Quiz
- Question
- AnswerOption
- UserProgress
- QuizAttempt
- Certificate

### AI Practice

- PracticeSession
- GesturePrediction
- PracticeFeedback

### Translation

- TranslationSession
- TranslationMessage
- TranslationHistory

### Dictionary

- SignWord
- SignCategory
- FavoriteSign

### Communication

- Notification
- Announcement
- ContactMessage

### File Storage

- File
- MediaAsset

### Administration

- AuditLog
- SystemSetting
- ActivityLog

---

## 5. USER MODEL

The User entity represents every authenticated user.

### Suggested Fields

- `id`
- `email`
- `firebaseUid`
- `firstName`
- `lastName`
- `phone`
- `dateOfBirth`
- `gender`
- `profileImage`
- `bio`
- `preferredLanguage`
- `country`
- `state`
- `city`
- `roleId`
- `organizationId`
- `isVerified`
- `isActive`
- `lastLoginAt`
- `createdAt`
- `updatedAt`
- `deletedAt`

### Relationships

- belongs to Role
- belongs to Organization
- has many Progress
- has many PracticeSessions
- has many Notifications
- has many TranslationSessions

---

## 6. ROLE MODEL

### Fields

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

### Default Roles

- Learner
- Teacher
- Hospital
- NGO
- Government
- Admin

---

## 7. ORGANIZATION MODEL

### Fields

- `id`
- `name`
- `type`
- `email`
- `phone`
- `address`
- `city`
- `state`
- `country`
- `website`
- `logo`
- `createdAt`
- `updatedAt`

### Relationships

- Organization → Many Users

---

## 8. COURSE MODEL

### Fields

- `id`
- `title`
- `slug`
- `description`
- `difficulty`
- `thumbnail`
- `estimatedDuration`
- `status`
- `createdBy`
- `createdAt`
- `updatedAt`

### Relationships

- Course → Many Modules

---

## 9. MODULE MODEL

### Fields

- `id`
- `courseId`
- `title`
- `order`
- `description`
- `createdAt`
- `updatedAt`

### Relationships

- Module → Many Lessons

---

## 10. LESSON MODEL

### Fields

- `id`
- `moduleId`
- `title`
- `description`
- `videoUrl`
- `thumbnail`
- `duration`
- `order`
- `createdAt`
- `updatedAt`

---

## 11. QUIZ MODELS

### Relationships

- Quiz → Many Questions
- Question → Many Answer Options
- User → Many Quiz Attempts

### Each Attempt Stores

- score
- completion time
- answers
- accuracy

---

## 12. USER PROGRESS

Tracks learning progress.

### Fields

- `userId`
- `lessonId`
- `completed`
- `completionDate`
- `watchTime`
- `accuracy`

---

## 13. CERTIFICATES

Generated after completing courses.

### Fields

- `certificateNumber`
- `courseId`
- `userId`
- `issuedDate`
- `verificationCode`
- `pdfUrl`

Certificates should be uniquely verifiable.

---

## 14. PRACTICE SESSION

Stores AI practice history.

### Fields

- `id`
- `userId`
- `lessonId`
- `confidenceScore`
- `accuracy`
- `feedback`
- `duration`
- `createdAt`

This table records user practice but does not store the AI model itself.

---

## 15. GESTURE PREDICTIONS

Stores AI predictions for analysis.

### Fields

- `id`
- `practiceSessionId`
- `predictedGesture`
- `confidence`
- `processingTime`
- `modelVersion`

Useful for improving future AI models.

---

## 16. TRANSLATION SESSION

Each communication session.

### Fields

- `id`
- `userId`
- `type`
- `startedAt`
- `endedAt`
- `status`

### Types

- Text → Sign
- Speech → Sign
- Sign → Text

---

## 17. TRANSLATION HISTORY

Stores translation records.

### Fields

- `id`
- `sessionId`
- `inputText`
- `outputText`
- `confidence`
- `language`
- `createdAt`

---

## 18. SIGN DICTIONARY

Every ISL gesture.

### Fields

- `id`
- `word`
- `meaning`
- `categoryId`
- `videoUrl`
- `imageUrl`
- `difficulty`
- `createdAt`

**Future enhancement:** Support regional variations and multilingual definitions.

---

## 19. FAVORITES

Allows users to bookmark signs.

### Fields

- `id`
- `userId`
- `signId`
- `createdAt`

---

## 20. NOTIFICATIONS

Stores system notifications.

### Fields

- `id`
- `userId`
- `title`
- `message`
- `type`
- `isRead`
- `createdAt`

### Types

- Course
- AI
- Achievement
- Announcement
- Reminder

---

## 21. FILES

Metadata only.

### Fields

- `id`
- `ownerId`
- `fileName`
- `url`
- `mimeType`
- `size`
- `provider`
- `uploadedAt`

### Providers

- Cloudinary
- AWS S3 (future)

---

## 22. AUDIT LOG

Stores important security events.

### Fields

- `id`
- `userId`
- `action`
- `resource`
- `resourceId`
- `ipAddress`
- `device`
- `timestamp`

Audit logs should never be modified after creation.

---

## 23. SYSTEM SETTINGS

Stores configurable platform values.

### Examples

- maintenance mode
- AI confidence threshold
- supported languages
- certificate templates
- feature flags

Avoid hardcoding configuration values in the application.

---

## 24. INDEXING STRATEGY

Add indexes for:

- `email`
- `firebaseUid`
- course `slug`
- lesson `order`
- `organization`
- translation timestamps
- notification status
- `createdAt`
- foreign keys

Review indexes periodically based on query performance.

---

## 25. MIGRATION STRATEGY

### Rules

- One logical change per migration
- Never edit applied migrations
- Test migrations locally
- Keep migrations in version control
- Include rollback considerations where feasible

---

## 26. SEED DATA

Initial seed should create:

### Roles

- Learner
- Teacher
- Hospital
- NGO
- Government
- Admin

### Admin User

A development administrator account using environment variables.

### Sample Organization

Example institution for development.

### Sample Course

One beginner ISL course with a few modules and lessons.

This data should be clearly marked as development-only.

---

## 27. FUTURE DATABASE EXPANSION

The schema should be designed to support future features without major redesign, including:

- Multiple AI models
- Multiple sign languages
- Offline synchronization
- Payment subscriptions
- Event management
- Community forums
- Mentor programs
- Live classes
- Video conferencing
- Research datasets
- Enterprise tenants (multi-tenancy)
- Public APIs

---

## 28. ERD REQUIREMENT

Before implementation, generate a complete Entity Relationship Diagram (ERD) showing:

- All entities
- Primary keys
- Foreign keys
- One-to-one relationships
- One-to-many relationships
- Many-to-many relationships
- Optional relationships

The ERD should be kept in the `/docs/database` directory and updated whenever the schema changes.

---

## 29. PRISMA MODEL GUIDELINES

When generating Prisma models:

- Use UUIDs (`@default(uuid())`) for primary keys.
- Use enums for fixed-value fields where appropriate (e.g., roles, organization types).
- Define explicit relations with descriptive names.
- Add indexes using `@@index`.
- Add unique constraints with `@@unique` where needed.
- Keep model definitions readable and grouped logically.
- Avoid embedding business logic in Prisma models.

---

## 30. FINAL DIRECTIVE

This schema is the foundation of SignBridge AI.

When implementing:

- Build models incrementally.
- Validate relationships before adding new entities.
- Keep migrations small and reviewable.
- Prioritize data integrity, scalability, and clarity over premature optimization.

Never add or remove database entities without explaining the impact on existing relationships and
APIs.
