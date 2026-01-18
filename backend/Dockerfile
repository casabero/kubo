# Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

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

EXPOSE 3000

CMD ["node", "dist/server.js"]
