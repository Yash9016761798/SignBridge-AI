# ============================================================
# SignBridge Web - Next.js Frontend
# ============================================================

FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN pnpm --filter @signbridge/web build

# Debug: Check build output
RUN echo "========== .next ==========" && \
    ls -la /app/apps/web/.next && \
    echo "========== standalone ==========" && \
    ls -la /app/apps/web/.next/standalone || true

# ------------------------------------------------------------
# Runner
# ------------------------------------------------------------

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -S nodejs
RUN adduser -S nextjs -G nodejs

# Copy standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]