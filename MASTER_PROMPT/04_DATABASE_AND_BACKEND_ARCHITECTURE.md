# SIGNBRIDGE AI

## Database & Backend Architecture

**Version:** 1.0

This document defines the backend architecture, database design principles, authentication strategy,
API standards, security model, and development workflow for SignBridge AI.

This document is the single source of truth for all backend development.

Do not generate backend code until the architecture defined here has been understood.

---

## 1. BACKEND MISSION

The backend is responsible for:

- Business logic
- Authentication & authorization
- User management
- Course management
- Translation orchestration
- AI service communication
- Progress tracking
- Notifications
- Dashboard analytics
- Audit logging
- File metadata
- API documentation
- Integration with external services

The backend must never contain AI inference logic directly. All AI processing is delegated to the
dedicated Python service.

---

## 2. BACKEND ARCHITECTURE

The backend follows Clean Architecture with clear separation of responsibilities.

```
Client (Web / Mobile)
          │
          ▼
Controller Layer
          │
          ▼
DTO Validation
          │
          ▼
Service Layer
          │
          ▼
Repository Layer
          │
          ▼
Prisma ORM
          │
          ▼
PostgreSQL
```

### Responsibilities

**Controller**

- Receives requests
- Validates input
- Calls services
- Returns responses
- Never contains business logic

**Service**

- Implements business rules
- Coordinates workflows
- Calls repositories
- Calls external APIs

**Repository**

- Database interaction only
- No business logic
- Uses Prisma ORM

---

## 3. MODULE ORGANIZATION

Every feature must be isolated in its own NestJS module.

```
backend/src/
├── auth/
├── users/
├── roles/
├── courses/
├── lessons/
├── practice/
├── translation/
├── dictionary/
├── dashboard/
├── institutions/
├── notifications/
├── analytics/
├── uploads/
├── settings/
├── admin/
├── common/
├── config/
└── database/
```

Each module should include:

```
module/
├── controller.ts
├── service.ts
├── repository.ts
├── dto/
├── entities/
├── interfaces/
├── validators/
├── constants/
├── tests/
└── module.ts
```

---

## 4. DATABASE PRINCIPLES

The application uses PostgreSQL with Prisma ORM.

### Rules

- UUID primary keys
- Foreign keys for all relationships
- Soft delete where appropriate
- Automatic timestamps
- Indexed search fields
- Consistent naming
- Explicit constraints

Every table should include:

| Field       | Description                       |
| ----------- | --------------------------------- |
| `id`        | UUID primary key                  |
| `createdAt` | Automatic timestamp               |
| `updatedAt` | Automatic timestamp               |
| `deletedAt` | Nullable when soft delete is used |

---

## 5. CORE ENTITIES

The initial domain model includes:

| Entity                        | Purpose                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| **User**                      | Stores authentication and profile information                  |
| **Role**                      | Defines permissions                                            |
| **Course**                    | Learning programs                                              |
| **Lesson**                    | Individual learning units                                      |
| **Quiz**                      | Assessment questions                                           |
| **Progress**                  | Tracks learner completion                                      |
| **Certificate**               | Issued upon successful completion                              |
| **TranslationHistory**        | Stores translation sessions                                    |
| **GestureRecognitionSession** | Tracks AI practice attempts                                    |
| **Notification**              | User notifications                                             |
| **Organization**              | Represents schools, NGOs, hospitals, or government departments |
| **AuditLog**                  | Security and activity logging                                  |
| **File**                      | Metadata for uploaded assets                                   |

---

## 6. ENTITY RELATIONSHIPS

```
User
 ├── belongs to Role
 ├── has many Progress
 ├── has many Certificates
 ├── has many TranslationHistory
 ├── has many Notifications
 └── belongs to Organization (optional)

Course
 ├── has many Lessons
 └── has many Quizzes

Lesson
 ├── belongs to Course
 └── has many Practice Sessions

Progress
 ├── belongs to User
 └── belongs to Lesson

AuditLog
 └── belongs to User
```

Design relationships to minimize redundancy and maintain referential integrity.

---

## 7. AUTHENTICATION

Authentication is handled using Firebase Authentication.

### Supported Methods

- Email & Password
- Google Sign-In
- Phone Authentication (future)

The backend verifies Firebase ID tokens and issues a JWT for application-specific authorization when
required.

Never store plaintext passwords.

---

## 8. ROLE-BASED ACCESS CONTROL (RBAC)

### Supported Roles

- Learner
- Teacher
- Hospital Staff
- NGO Staff
- Government Officer
- Administrator

Authorization checks should be enforced at the service layer and exposed through NestJS guards.

Permissions should be configurable rather than hardcoded.

---

## 9. API STANDARDS

All APIs follow REST principles.

### Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {}
}
```

### Error Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

### HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Unprocessable Entity  |
| 500  | Internal Server Error |

---

## 10. VALIDATION

Every request must be validated using DTOs.

### Rules

- Validate input types
- Validate required fields
- Validate enums
- Validate file size and type
- Sanitize user input

Reject invalid requests before business logic executes.

---

## 11. ERROR HANDLING

Centralize exception handling.

### Requirements

- Human-readable messages
- Internal error codes
- No stack traces in production
- Structured logging
- Correlation IDs for tracing requests

---

## 12. LOGGING

Use structured logging for:

- Authentication events
- Permission failures
- API errors
- AI service requests
- File uploads
- Administrative actions

Avoid logging sensitive information.

---

## 13. AUDIT LOGGING

Audit logs should record:

| Field              | Description                 |
| ------------------ | --------------------------- |
| User ID            | Who performed the action    |
| Action             | What was done               |
| Resource           | Which resource was affected |
| Timestamp          | When it happened            |
| IP address         | Source of the request       |
| Device information | When available              |

Audit logs are immutable and intended for security and compliance.

---

## 14. FILE MANAGEMENT

Store files in Cloudinary.

The backend stores only metadata:

- File ID
- URL
- Owner
- MIME type
- Size
- Upload timestamp

Never store production uploads on the application server.

---

## 15. AI SERVICE INTEGRATION

The backend communicates with the AI service through REST APIs.

### Responsibilities

- Forward images or video references
- Receive predictions
- Validate responses
- Store recognition history
- Handle retries and timeouts

The backend must not perform model inference.

---

## 16. DATABASE MIGRATIONS

Use Prisma Migrate for schema changes.

### Migration Rules

- One logical change per migration
- Review generated SQL
- Test migrations on development data
- Never edit applied migrations
- Seed development data separately

---

## 17. SECURITY

Apply the following practices by default:

- HTTPS in production
- Secure HTTP headers
- CORS configuration
- Rate limiting
- Input validation
- Output encoding
- JWT verification
- Environment variables for secrets
- Principle of least privilege

Align with the OWASP Top 10 where applicable.

---

## 18. PERFORMANCE

Optimize backend performance by:

- Using database indexes
- Avoiding N+1 queries
- Paginating large datasets
- Returning only required fields
- Caching suitable read-heavy endpoints (optional Redis)
- Monitoring slow queries

---

## 19. TESTING

### Backend Testing Strategy

- Unit tests for services
- Integration tests for repositories
- API tests for controllers
- Authentication tests
- Authorization tests
- Validation tests
- Error handling tests

Critical business logic should not be merged without automated tests.

---

## 20. DEVELOPMENT WORKFLOW

For every backend feature:

1. Explain the feature.
2. Design the API contract.
3. Design the database impact.
4. Define DTOs.
5. Implement repository.
6. Implement service.
7. Implement controller.
8. Document the endpoint in Swagger.
9. Write tests.
10. Wait for user approval before moving to the next feature.

---

## FINAL DIRECTIVE

Treat this document as the backend constitution for SignBridge AI.

Do not introduce database tables, API endpoints, authentication methods, or architectural patterns
that conflict with this specification unless explicitly approved by the user.

Every backend module should be secure, maintainable, testable, and ready for long-term growth.
