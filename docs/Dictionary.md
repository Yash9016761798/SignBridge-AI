# Dictionary Module

## Overview

The Dictionary module provides a searchable, filterable ISL (Indian Sign Language) dictionary with categories, difficulty levels, alphabet browsing, and user favorites.

## Architecture

### Backend

**Module:** `apps/backend/src/dictionary/`

| File | Purpose |
|---|---|
| `dictionary.module.ts` | NestJS module registration |
| `dictionary.controller.ts` | REST endpoints with Swagger docs |
| `dictionary.service.ts` | Business logic, Prisma queries |
| `dto/create-sign-word.dto.ts` | Create sign word validation |
| `dto/update-sign-word.dto.ts` | Update sign word validation |
| `dto/query-sign-word.dto.ts` | Query/filter params validation |
| `dto/category.dto.ts` | Category CRUD validation |

### Frontend

**Pages:** `apps/web/app/(dashboard)/dictionary/`

| File | Purpose |
|---|---|
| `page.tsx` | Dictionary home with search, filters, grid |
| `[id]/page.tsx` | Sign detail page with video/meaning |

**Components:** `apps/web/components/dictionary/`

| File | Purpose |
|---|---|
| `SignCard.tsx` | Sign word card with favorite toggle |
| `AlphabetFilter.tsx` | A-Z letter filter with counts |
| `CategoryBrowser.tsx` | Horizontal category pill selector |
| `DifficultyBadge.tsx` | Beginner/Intermediate/Advanced badge |

**Types:** `apps/web/types/dictionary.ts`

**API Service:** `apps/web/lib/dictionary-api.ts`

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dictionary/signs` | Public | List signs with search, filters, pagination |
| GET | `/dictionary/signs/:id` | Public | Get sign word detail |
| POST | `/dictionary/signs` | Admin | Create sign word |
| PUT | `/dictionary/signs/:id` | Admin | Update sign word |
| DELETE | `/dictionary/signs/:id` | Admin | Delete sign word |
| GET | `/dictionary/categories` | Public | List all categories with counts |
| GET | `/dictionary/categories/:id` | Public | Get category with its signs |
| POST | `/dictionary/categories` | Admin | Create category |
| PUT | `/dictionary/categories/:id` | Admin | Update category |
| DELETE | `/dictionary/categories/:id` | Admin | Delete category |
| POST | `/dictionary/favorites/:signId` | User | Toggle favorite |
| GET | `/dictionary/alphabet-stats` | Public | Get sign count per letter |

## Query Parameters (GET /dictionary/signs)

| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | - | Text search on word and meaning |
| `categoryId` | string | - | Filter by category ID |
| `difficulty` | BEGINNER/INTERMEDIATE/ADVANCED | - | Filter by difficulty |
| `letter` | string | - | Filter by starting letter |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `sortBy` | word/createdAt/difficulty | word | Sort field |
| `sortOrder` | asc/desc | asc | Sort direction |
| `userId` | string | - | Filter by favorites of user |

## Database Models

- **SignCategory:** id, name, description, icon, timestamps
- **SignWord:** id, word, meaning, videoUrl, imageUrl, difficulty (enum), categoryId, tags, timestamps
- **FavoriteSign:** id, userId, signId, timestamps (unique constraint on userId+signId)

## Seed Data

The seed script creates 10 categories and 90+ sign words across:
- Greetings (7 signs)
- Numbers (7 signs)
- Daily Communication (12 signs)
- Emotions (6 signs)
- Family (8 signs)
- Food & Drink (7 signs)
- Alphabet (26 signs A-Z)
- Travel (6 signs)
- Health (5 signs)
- Colors (10 signs)

## Frontend Features

- **Search:** Real-time text search on word and meaning
- **Category filter:** Horizontal scrollable category pills with sign counts
- **Alphabet filter:** A-Z buttons with per-letter sign counts
- **Difficulty filter:** Dropdown for Beginner/Intermediate/Advanced
- **Grid/List toggle:** Switch between card grid and list view
- **Favorites:** Heart button on cards and detail page (requires auth)
- **Pagination:** Page-based navigation with page numbers
- **Detail page:** Full sign info with video placeholder and share button
