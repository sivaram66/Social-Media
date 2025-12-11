# Use official Node.js image
FROM node:22-slim

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the project
COPY . .

# Ensure NODE_ENV is production
ENV NODE_ENV=production


ENV PORT=3000
EXPOSE 3000

# Start the app
CMD ["node", "src/app.js"]