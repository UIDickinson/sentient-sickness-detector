# Multi-stage build for Dog Symptom Checker
# Stage 1: Build stage with all dependencies
FROM node:18-alpine AS builder

# Install system dependencies needed for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code and build configuration
COPY . .

# Copy the CSV dataset to the build context
COPY attached_assets/symtomdata_1757954561163.csv ./attached_assets/

# Build both frontend and backend
RUN npm run build

# Stage 2: Production runtime
FROM node:18-alpine AS production

# Install curl for health checks and other runtime dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy the CSV dataset
COPY --from=builder --chown=nextjs:nodejs /app/attached_assets ./attached_assets

# Copy any other required runtime files
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

# Change ownership of the app directory and switch to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/symptoms || exit 1

# Start the application
CMD ["npm", "start"]