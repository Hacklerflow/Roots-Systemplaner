# Roots Configurator Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build argument for API URL (empty for nginx proxy)
ARG VITE_API_URL=

# Build application (VITE_ vars are automatically picked up)
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Add health endpoint
RUN echo '{"status":"ok"}' > /usr/share/nginx/html/health

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
