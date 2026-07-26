# ============================================================
# SignBridge Web - Next.js Frontend
# Multi-stage build with standalone output
# ============================================================

ARG NODE_VERSION=18

# ------------------------------------------------------------
# Stage 1: Install dependencies
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------
# Stage 2: Build the application
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/node_modules

# Copy source code
COPY . .

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @signbridge/web build

# ------------------------------------------------------------
# Stage 3: Production runner
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/web/public ./public

# Set correct permissions for Next.js
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3000', (r) => { r.statusCode === 200 ? process.exit(0) : process.exit(1); }).on('error', () => process.exit(1))" || exit 1

CMD ["node", "apps/web/server.js"]
