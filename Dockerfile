# syntax=docker/dockerfile:1.7
# Multi-stage build for the Pegasus CRM Next.js app.
#
# Produces a small runtime image using Next.js `output: "standalone"`.
# See https://nextjs.org/docs/app/building-your-application/deploying#docker-image

# --- deps: install dependencies once, cache aggressively ---------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# --- builder: compile Next.js in standalone mode -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# --- runner: tiny production image ------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Standalone output ships a minimal server.js + node_modules subset.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

# --- migrator: tiny image that applies Drizzle migrations and exits ---------
# Built from the same tree so schema + SQL stay in lock-step with the app.
# Used by docker-compose.prod.yml as a one-shot init container before `app`.
FROM node:20-alpine AS migrator
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Reuse the fully-installed node_modules from the `deps` stage so we don't
# repeat the npm ci step. tsx + drizzle-orm are already in there.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src/db ./src/db
COPY src/features ./src/features

ENV NODE_ENV=production

# By default, run migrate. Override in compose to run the seed instead:
#   command: ["npx", "tsx", "src/db/seed.ts"]
CMD ["npx", "tsx", "src/db/migrate.ts"]
