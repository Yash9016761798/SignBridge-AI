# SIGNBRIDGE AI

## Technology Stack & System Architecture

**Version:** 1.0

This document defines the official technology stack, architecture, coding standards, project
structure, deployment strategy, and engineering conventions for SignBridge AI.

Once these decisions are established, they must remain consistent throughout the project unless
explicitly changed by the user.

---

## 1. ARCHITECTURAL PRINCIPLES

This project must be designed as a production-ready, modular, scalable, cloud-native system.

The architecture must satisfy the following principles:

- Clean Architecture
- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Feature-Based Modular Architecture
- Repository Pattern
- Dependency Injection
- Domain Separation
- Layered Design
- API-First Development
- Mobile-First Thinking
- Accessibility by Design
- Security by Default

---

## 2. SYSTEM ARCHITECTURE

The application is composed of four major systems:

```
                 Users
                    │
        ┌───────────┴────────────┐
        │                        │
   Web Application         Mobile Application
      (Next.js)               (Flutter)
        │                        │
        └───────────┬────────────┘
                    │
              REST API Gateway
                    │
               NestJS Backend
                    │
      ┌─────────────┼──────────────┐
      │             │              │
 PostgreSQL    Firebase Auth   AI Service
    Prisma                        FastAPI
                                    │
                     MediaPipe + TensorFlow + OpenCV
```

---

## 3. PROGRAMMING LANGUAGES

### Web

| Property | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Language | TypeScript                                                                         |
| Reason   | Type safety, better refactoring, enterprise standard, shared language with backend |

### Backend

| Property  | Value                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------ |
| Language  | TypeScript                                                                                       |
| Framework | NestJS                                                                                           |
| Reason    | Modular architecture, excellent dependency injection, enterprise scalability, strong API support |

### Mobile

| Property  | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Language  | Dart                                                                         |
| Framework | Flutter                                                                      |
| Reason    | One codebase, Android, iOS, smooth UI, camera support, excellent performance |

### AI

| Property | Value                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Language | Python                                                                                                                        |
| Reason   | Python has the strongest ecosystem for Machine Learning, Computer Vision, TensorFlow, MediaPipe, OpenCV, Scientific Computing |

Never implement AI inference inside NestJS.  
AI must remain a separate service.

---

## 4. FRONTEND STACK

| Category          | Technology                      |
| ----------------- | ------------------------------- |
| Framework         | Next.js (latest stable version) |
| Language          | TypeScript                      |
| UI Library        | React                           |
| Styling           | Tailwind CSS                    |
| Component Library | shadcn/ui                       |
| Icons             | Lucide React                    |
| Animation         | Framer Motion                   |
| Forms             | React Hook Form                 |
| Validation        | Zod                             |
| State Management  | Zustand                         |
| Data Fetching     | TanStack Query (React Query)    |
| HTTP Client       | Axios                           |
| Charts            | Recharts                        |
| Tables            | TanStack Table                  |
| Notifications     | Sonner                          |

---

## 5. MOBILE STACK

| Category         | Technology               |
| ---------------- | ------------------------ |
| Framework        | Flutter (latest stable)  |
| Language         | Dart                     |
| State Management | Riverpod                 |
| Routing          | GoRouter                 |
| Networking       | Dio                      |
| Local Database   | Hive                     |
| Secure Storage   | Flutter Secure Storage   |
| Camera           | camera package           |
| Image Processing | image package            |
| Notifications    | Firebase Cloud Messaging |

---

## 6. BACKEND STACK

| Category          | Technology                    |
| ----------------- | ----------------------------- |
| Framework         | NestJS                        |
| Language          | TypeScript                    |
| ORM               | Prisma                        |
| Database          | PostgreSQL                    |
| Authentication    | Firebase Authentication + JWT |
| Validation        | class-validator               |
| API Documentation | Swagger                       |
| File Upload       | Multer                        |
| Caching           | Redis (optional)              |
| Logging           | Pino                          |
| Testing           | Jest                          |

---

## 7. AI STACK

| Category  | Technology                                                         |
| --------- | ------------------------------------------------------------------ |
| Framework | FastAPI                                                            |
| Libraries | TensorFlow, MediaPipe, OpenCV, NumPy, Pandas, Scikit-learn, Pillow |

The AI service must expose REST endpoints to the backend.

Example responsibilities:

- Sign recognition
- Image preprocessing
- Video preprocessing
- Model inference
- Confidence scoring

---

## 8. DATABASE

| Category          | Technology     |
| ----------------- | -------------- |
| Official Database | PostgreSQL     |
| ORM               | Prisma         |
| Migration         | Prisma Migrate |

**Reason:** Reliable, ACID compliant, excellent relational support, free, industry standard.

Never write raw SQL unless necessary.

---

## 9. AUTHENTICATION

| Category               | Technology                                        |
| ---------------------- | ------------------------------------------------- |
| Primary Authentication | Firebase Authentication                           |
| Support                | Email, Password, Google Login, Phone OTP (future) |
| Authorization          | JWT                                               |

### RBAC Roles

- Learner
- Teacher
- Hospital
- NGO
- Government
- Administrator

---

## 10. STORAGE

| Category  | Technology |
| --------- | ---------- |
| Images    | Cloudinary |
| Documents | Cloudinary |
| Future    | AWS S3     |

Never store uploaded files on the backend server in production.

---

## 11. API STYLE

Only REST APIs.  
Every endpoint must follow REST conventions.

### Example

```
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

### Every endpoint must return

- `success`
- `message`
- `data`
- `pagination` (if applicable)

---

## 12. PROJECT STRUCTURE

```
signbridge-ai/
├── web/
├── mobile/
├── backend/
├── ai-service/
├── docs/
├── docker/
├── infrastructure/
├── scripts/
├── database/
├── assets/
├── .github/
└── README.md
```

Never change this structure without approval.

---

## 13. BACKEND STRUCTURE

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
├── notifications/
├── institutions/
├── hospital/
├── ngo/
├── government/
├── admin/
├── common/
├── config/
└── database/
```

Every feature must be isolated.

---

## 14. FRONTEND STRUCTURE

```
web/
├── app/
├── components/
├── features/
├── hooks/
├── services/
├── lib/
├── types/
├── utils/
├── constants/
├── styles/
└── public/
```

Feature-first architecture.

---

## 15. FLUTTER STRUCTURE

```
lib/
├── core/
│   ├── config/
│   ├── services/
├── features/
├── shared/
│   ├── widgets/
│   ├── models/
├── routes/
├── theme/
└── utils/
```

---

## 16. MICROSERVICE COMMUNICATION

```
Next.js
    ↓
NestJS
    ↓
FastAPI
    ↓
TensorFlow
```

Never call the AI service directly from the frontend.  
Always use the backend as the API gateway.

---

## 17. ENVIRONMENT VARIABLES

Every secret belongs in environment variables.

**Never hardcode:**

- Keys
- URLs
- Passwords
- Tokens
- Secrets

**Use:**

- `.env.local`
- `.env.development`
- `.env.production`

---

## 18. DEPLOYMENT

| Category | Technology          |
| -------- | ------------------- |
| Frontend | Vercel              |
| Backend  | Railway             |
| Database | Supabase PostgreSQL |
| AI       | Railway or Render   |
| Storage  | Cloudinary          |
| CI/CD    | GitHub Actions      |
| Docker   | Docker Compose      |

---

## 19. GITHUB REPOSITORY

```
SignBridge-AI/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── docs/
├── backend/
├── web/
├── mobile/
├── ai-service/
└── docker/
```

Every module should include clear documentation.

---

## 20. AI DATASET RULE

This rule is mandatory.

Do not begin AI model development immediately.

Instead:

1. Build the complete application architecture.
2. Create placeholder AI endpoints.
3. Define API contracts.
4. Wait for the user to provide the Indian Sign Language dataset or GitHub repository.
5. Analyze the dataset structure.
6. Evaluate labels, classes, annotations, and preprocessing needs.
7. Design the training pipeline.
8. Train and validate the model.
9. Integrate the trained model into the AI service.

Never assume the dataset format or labels.

---

## 21. CODING STANDARDS

- Use strict TypeScript.
- Prefer composition over inheritance.
- Write small, focused functions.
- Avoid duplicated logic.
- Use meaningful names.
- Keep files reasonably sized.
- Document public APIs.
- Handle errors gracefully.
- Validate all inputs.
- Log important operations.
- Write unit tests for business logic.

---

## 22. DECISION PRIORITY

When multiple solutions exist, choose the one that best satisfies this order:

1. Security
2. Maintainability
3. Accessibility
4. Scalability
5. Performance
6. Developer Experience
7. Simplicity

If a trade-off is necessary, explain it before implementing.

---

## 23. QUALITY GATES

A feature is complete only if:

- It builds successfully.
- Linting passes.
- Type checking passes.
- Unit tests pass.
- API documentation is updated.
- Error handling is implemented.
- Accessibility considerations are addressed.
- No secrets are exposed.
- The feature is documented.

---

## FINAL DIRECTIVE

Treat this document as the technical constitution for SignBridge AI.

Do not introduce new frameworks, programming languages, or architectural patterns unless the user
explicitly approves the change.

Every future implementation must align with these standards.
