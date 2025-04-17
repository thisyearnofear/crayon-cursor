FROM node:22-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Copy package-lock.json if it exists (using a wildcard pattern)
COPY package-lock.json* ./

# Install dependencies (using npm install instead of npm ci for flexibility)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the application
COPY . .

# Expose the port the server runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
