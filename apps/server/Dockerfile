# Production Dockerfile for Veda AI Backend Server (run from monorepo root)
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/config/package.json ./packages/config/package.json
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/server

# Production runner image
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/packages/types ./packages/types

EXPOSE 4000
ENV PORT 4000
CMD ["npm", "start", "--workspace=apps/server"]
