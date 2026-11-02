# syntax=docker.io/docker/dockerfile:1

# CyaniAgent Docs — production image (Fumadocs MDX + Next.js standalone)
# https://fumadocs.dev/docs/deploying#nextjs--docker
# Based on the official Next.js Dockerfile example:
# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:24-alpine AS base
# libc6-compat: glibc shim for native addons on musl (Alpine)
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------------
# deps: install dependencies only when needed
# ---------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# next.config.mjs rides along so the install layer invalidates when the
# framework config changes (Fumadocs MDX needs it present at build time)
COPY package.json package-lock.json next.config.mjs ./
RUN npm ci

# ---------------------------------------------------------------------------
# builder: compile the app (MDX content is baked in at build time)
# ---------------------------------------------------------------------------
FROM base AS builder
# git is required at build time: lib/page-info.ts runs `git log` inside
# content/docs (the content submodule) to compute "last updated" dates
RUN apk add --no-cache git
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# fail fast with a clear message when the content submodule wasn't cloned
RUN test -d content/docs/zh || \
    (echo 'ERROR: content/docs is empty. Run: git submodule update --init --recursive' >&2 && exit 1)

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# runner: minimal production image
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# public/ and .next/static are excluded from the standalone trace on purpose,
# so they are copied in explicitly (same as the official example)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# /zh is the default locale's home page (statically generated)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/zh',r=>process.exit(r.statusCode<400?0:1)).on('error',()=>process.exit(1))"

# server.js is produced by `next build` (output: 'standalone')
CMD ["node", "server.js"]
