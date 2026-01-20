FROM node:20-alpine AS builder

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

# Install system dependencies for Prisma and Healthchecks
RUN apk add --no-cache openssl libc6-compat curl

WORKDIR /app

# Create and use node user (UID 1000)
# The node:20-alpine image already includes the node user with UID 1000
# Ensure /app is owned by the node user
RUN chown -R 1000:1000 /app

USER node

# Copy built files and production dependencies
COPY --from=builder --chown=1000:1000 /app/dist ./dist
COPY --from=builder --chown=1000:1000 /app/package*.json ./
RUN npm install --only=production
COPY --from=builder --chown=1000:1000 /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=1000:1000 /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=1000:1000 /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
