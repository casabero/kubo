# Production Dockerfile for Frontend (Nginx)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 2>&1 || (echo "BUILD FAILED WITH:" && cat /root/.npm/_logs/*.log 2>/dev/null || true && exit 1)

FROM nginx:stable-alpine
RUN apk add --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
