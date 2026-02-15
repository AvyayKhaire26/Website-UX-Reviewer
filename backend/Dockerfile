FROM node:18

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Install Playwright browsers
RUN npx playwright install chromium --with-deps

# Clean up dev dependencies
RUN npm ci --only=production && npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"]
