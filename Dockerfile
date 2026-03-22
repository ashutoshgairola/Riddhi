# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS fe-builder
WORKDIR /fe
RUN corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

# ── Stage 2: Build backend ────────────────────────────────────────────────────
FROM node:20-alpine AS be-builder
WORKDIR /be
RUN corepack enable
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY backend/ .
RUN pnpm build

# ── Stage 3: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine
RUN apk add --no-cache nginx supervisor

# Backend: production dependencies only
WORKDIR /app
RUN corepack enable
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=be-builder /be/build ./build
RUN mkdir -p /app/uploads

# Frontend: static files served by nginx
COPY --from=fe-builder /fe/dist /usr/share/nginx/html

# nginx config (uses localhost upstream instead of Docker DNS)
COPY nginx.prod.conf /etc/nginx/http.d/default.conf

# supervisord manages nginx + node
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
