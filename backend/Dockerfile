# Development Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for NestJS CLI)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set environment to development
ENV NODE_ENV=development

# Expose the port
EXPOSE 3001

# Run migrations and start in development mode with hot-reload
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]
