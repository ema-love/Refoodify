# Dockerfile for Refoodify app
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy app files
COPY . /usr/src/app

# Install only production dependencies (if any)
RUN if [ -f package.json ]; then npm install --production; fi

# Expose port (default 3000)
EXPOSE 3000

# Use PORT env or default
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
