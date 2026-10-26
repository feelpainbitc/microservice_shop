
FROM node:24-alpine AS builder

WORKDIR /app

# Root package and workspace manifests
COPY package.json package-lock.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY apps/users/package.json ./apps/users/package.json
COPY apps/catalog/package.json ./apps/catalog/package.json
COPY apps/orders/package.json ./apps/orders/package.json
COPY libs/shared/package.json ./libs/shared/package.json
COPY libs/dto/package.json ./libs/dto/package.json

RUN npm ci

# Application sources, shared libraries, proto contracts and Prisma schemas
COPY apps ./apps
COPY libs ./libs

# Generate Prisma Client for each service
RUN npm exec -w users -- prisma generate --config prisma7.config.ts \
    && npm exec -w catalog -- prisma generate --config prisma7.config.ts \
    && npm exec -w orders -- prisma generate --config prisma7.config.ts

# Build shared libraries before applications
RUN npm run build -w @microservices-shop/shared \
    && npm run build -w @microservices-shop/dto

# Build applications
RUN npm run build -w api-gateway \
    && npm run build -w users \
    && npm run build -w catalog \
    && npm run build -w orders

# Runtime image
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000 3001 3002 3003 5001 5002 5003

CMD ["npm", "run", "start:prod", "-w", "api-gateway"]
