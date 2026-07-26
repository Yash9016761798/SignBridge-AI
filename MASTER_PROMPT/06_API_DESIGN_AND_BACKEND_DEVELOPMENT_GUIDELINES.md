# SIGNBRIDGE AI

## API Design & Backend Development Guidelines

**Version:** 1.0

This document establishes the official API standards, backend development workflow, request/response
conventions, security rules, documentation requirements, testing practices, and lifecycle management
for every backend endpoint in SignBridge AI.

Every API generated for this project must follow these guidelines.

---

## 1. API DESIGN PHILOSOPHY

The backend is the central communication layer between:

- Web Application
- Mobile Application
- AI Service
- Database
- Third-Party Services

APIs must be:

- Predictable
- Consistent
- Versioned
- Secure
- Scalable
- Well documented
- Backward compatible where possible

Never create APIs without first understanding the business requirement.

---

## 2. API ARCHITECTURE

### Communication Flow

```
Frontend (Next.js)
        │
Flutter Mobile
        │
        ▼
 NestJS REST API
        │
        ▼
Business Services
        │
        ▼
Repository Layer
        │
        ▼
PostgreSQL

        │
        ▼
FastAPI AI Service
```

The frontend and mobile applications must never communicate directly with the database or AI
service.

---

## 3. API VERSIONING

All public APIs must be versioned.

### Example

```
/api/v1/auth/login
/api/v1/users
/api/v1/courses
/api/v1/translation
```

### Future Versions

```
/api/v2/...
```

Do not remove old versions until a migration strategy is defined.

---

## 4. REST ENDPOINT NAMING

Use nouns rather than verbs.

### Good

```
GET    /courses
POST   /courses
GET    /courses/{id}
PATCH  /courses/{id}
DELETE /courses/{id}
```

### Avoid

```
/createCourse
/updateCourse
/deleteCourse
```

Nested resources should reflect relationships.

### Example

```
GET /courses/{courseId}/modules
GET /modules/{moduleId}/lessons
GET /users/{userId}/progress
```

---

## 5. STANDARD RESPONSE FORMAT

### Successful Response

```json
{
  "success": true,
  "message": "Course retrieved successfully.",
  "data": {},
  "meta": {
    "timestamp": "2026-07-25T10:00:00Z"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Courses retrieved successfully.",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address."
    }
  ]
}
```

Use the same response structure across every module.

---

## 6. REQUEST VALIDATION

All incoming requests must be validated using DTOs and class-validator.

### Validate

- Required fields
- Data types
- Email addresses
- URLs
- Enum values
- File types
- File sizes
- String lengths
- Numeric ranges

Reject invalid requests before reaching the service layer.

---

## 7. AUTHENTICATION

### Authentication Flow

1. User authenticates with Firebase.
2. Client receives Firebase ID Token.
3. Token is sent to NestJS.
4. NestJS verifies the token.
5. User profile is loaded.
6. Role is resolved.
7. Authorization rules are applied.
8. Request proceeds.

Never trust client-provided role information.

---

## 8. AUTHORIZATION (RBAC)

Protect endpoints using Role-Based Access Control.

### Roles

- Learner
- Teacher
- Hospital
- NGO
- Government
- Administrator

### Role Permissions Example

```
Learner
  ├── View courses
  ├── Complete lessons
  ├── Practice signs
  └── View progress

Teacher
  ├── Create courses
  ├── Manage lessons
  └── View student analytics

Administrator
  ├── Manage users
  ├── Manage organizations
  ├── View audit logs
  └── Configure system settings
```

Authorization checks must occur before business logic executes.

---

## 9. PAGINATION

Endpoints returning collections must support pagination.

### Query Parameters

```
GET /courses?page=1&limit=20
```

### Defaults

- `page` = 1
- `limit` = 20

### Maximum Limit

- 100

---

## 10. FILTERING

Support filtering where applicable.

### Examples

```
GET /courses?difficulty=beginner
GET /lessons?moduleId=123
GET /users?role=teacher
```

Filters should be optional and composable.

---

## 11. SEARCH

Provide search using query parameters.

### Examples

```
GET /dictionary?search=hello
GET /courses?search=alphabet
```

Search should be case-insensitive where practical.

---

## 12. SORTING

Allow sorting on supported fields.

### Example

```
GET /courses?sort=title
GET /courses?sort=-createdAt
```

A leading `-` indicates descending order.

---

## 13. FILE UPLOADS

Use `multipart/form-data` for uploads.

- Supported file types should be validated.
- Store files in Cloudinary.
- Store only metadata in PostgreSQL.
- Reject oversized or unsupported files.

---

## 14. SWAGGER / OPENAPI

Every endpoint must include:

- Summary
- Description
- Tags
- Parameters
- Request schema
- Response schema
- Authentication requirements
- Error responses
- Example payloads

Swagger documentation should always reflect the current implementation.

---

## 15. ERROR HANDLING

Use centralized exception handling.

### Expose

- Human-readable messages
- Error codes
- Validation details

### Never Expose

- Stack traces
- SQL queries
- Internal server details
- Sensitive configuration

---

## 16. RATE LIMITING

Apply rate limits to sensitive endpoints such as:

- Login
- Registration
- Password reset
- AI prediction requests

Return HTTP 429 Too Many Requests when limits are exceeded.

---

## 17. LOGGING

### Log

- Authentication events
- Authorization failures
- API errors
- AI service requests
- File uploads
- Administrative actions

Avoid logging passwords, tokens, or other sensitive information.

---

## 18. API TESTING

Every endpoint should include:

- Success test
- Validation failure test
- Authentication failure test
- Authorization failure test
- Edge case test
- Error handling test

Use Jest for automated testing and support Postman collections for manual testing.

---

## 19. API DOCUMENTATION

Maintain:

- Swagger UI
- OpenAPI specification
- Postman Collection
- API changelog

Every new endpoint must update the documentation.

---

## 20. API LIFECYCLE

Before creating an endpoint:

1. Define the business requirement.
2. Design the request schema.
3. Design the response schema.
4. Identify affected entities.
5. Consider permissions.
6. Define validation rules.
7. Assess performance implications.
8. Implement.
9. Test.
10. Document.

---

## 21. API DEPRECATION

If an endpoint must be replaced:

1. Mark it as deprecated in documentation.
2. Introduce the replacement endpoint.
3. Maintain compatibility for a defined period.
4. Notify API consumers before removal.

---

## 22. BACKEND DEVELOPMENT CHECKLIST

Before marking a feature complete:

- Business logic implemented.
- DTO validation added.
- Authentication enforced.
- Authorization verified.
- Error handling implemented.
- Logging added.
- Swagger updated.
- Tests written.
- Performance reviewed.
- Documentation updated.

---

## 23. FINAL DIRECTIVE

Every API should be treated as a long-term public contract.

Do not change request or response formats without understanding the impact on:

- Web application
- Mobile application
- AI service
- External integrations
- Future API versions

Consistency is more important than short-term convenience.
