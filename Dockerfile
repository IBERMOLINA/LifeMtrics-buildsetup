# Use the official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create data directory for local storage
RUN mkdir -p data

# Create a non-root user to run the app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lifeos -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R lifeos:nodejs /app

# Switch to the non-root user
USER lifeos

# Expose the port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Define the command to run the app
CMD ["npm", "start"]