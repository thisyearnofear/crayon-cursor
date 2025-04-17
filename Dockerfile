FROM node:23.11.0-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port the server runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
