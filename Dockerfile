# Use official Playwright image with all browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.48.0-focal

# Create app directory
WORKDIR /app

# Copy package.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Expose Cloud Run port
ENV PORT=8080

# Start the server
CMD ["node", "server.js"]
