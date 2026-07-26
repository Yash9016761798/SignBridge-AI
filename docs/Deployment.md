# Deployment Guide

## Overview

SignBridge AI is deployed across multiple platforms:

| Service    | Platform   | URL               |
| ---------- | ---------- | ----------------- |
| Web        | Vercel     | app.signbridge.ai |
| Backend    | Railway    | api.signbridge.ai |
| AI Service | Railway    | ai.signbridge.ai  |
| Database   | Supabase   | -                 |
| Storage    | Cloudinary | -                 |

## Prerequisites

- Vercel account (for web)
- Railway account (for backend and AI service)
- Supabase account (for database)
- Cloudinary account (for file storage)
- GitHub repository access

## Environment Variables

### Web (Vercel)

Set these in Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://api.signbridge.ai
NEXT_PUBLIC_AI_URL=https://ai.signbridge.ai
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (Railway)

Set these in Railway service variables:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=your_supabase_url
CORS_ORIGIN=https://app.signbridge.ai
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=https://ai.signbridge.ai
```

### AI Service (Railway)

Set these in Railway service variables:

```
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS=["https://app.signbridge.ai","https://api.signbridge.ai"]
BACKEND_URL=https://api.signbridge.ai
```

## Deployment Steps

### Web (Automatic)

Vercel automatically deploys on push to `main`:

1. Push to `main` branch
2. Vercel triggers build
3. Deployment completes automatically

### Backend (Automatic)

Railway automatically deploys on push to `main`:

1. Push to `main` branch
2. Railway triggers build
3. Service restarts with new version

### AI Service (Manual)

```bash
# Using Railway CLI
railway up --service ai-service
```

## Database Migrations

```bash
# Run migrations in production
cd apps/backend
pnpm prisma migrate deploy
```

## Rollback

### Web

Vercel allows instant rollback to previous deployments via dashboard.

### Backend

Railway allows rollback to previous deploys via dashboard.

### Database

```bash
# Create a rollback migration
pnpm prisma migrate dev --create-only rollback_name
```

## Monitoring

- **Web**: Vercel Analytics
- **Backend**: Railway metrics
- **AI Service**: Custom logging
- **Database**: Supabase dashboard

## SSL/HTTPS

All services use automatic SSL certificates:

- Vercel: Automatic
- Railway: Automatic
- Supabase: Built-in
