# =================================
# MATRIMONY SERVICES API - DOCKERFILE
# Multi-stage build for production optimization
# =================================

# =================================
# STAGE 1: BUILD
# =================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Generate Prisma client
RUN npm run db:generate

# Build the application
RUN npm run build

# =================================
# STAGE 2: PRODUCTION
# =================================
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Install production dependencies only
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy Prisma schema and generate client
COPY --chown=nextjs:nodejs src/database/schema.prisma ./src/database/schema.prisma
RUN npx prisma generate

# Create necessary directories
RUN mkdir -p uploads logs && \
    chown -R nextjs:nodejs uploads logs

# Copy other necessary files
COPY --chown=nextjs:nodejs .env.example ./.env

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER nextjs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# =================================
# STAGE 3: DEVELOPMENT
# =================================
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Install development dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY src ./src

# Create directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"] 