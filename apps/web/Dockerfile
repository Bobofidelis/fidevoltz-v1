# Frontend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/package*.json ./apps/frontend/
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["npm", "start"]
