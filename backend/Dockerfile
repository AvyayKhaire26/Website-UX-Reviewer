FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Install Playwright and its browsers
RUN npx playwright install chromium --with-deps

# Clean dev dependencies (keep playwright)
RUN npm prune --production

# Create screenshots directory
RUN mkdir -p /app/screenshots

EXPOSE 3000

CMD ["npm", "start"]
