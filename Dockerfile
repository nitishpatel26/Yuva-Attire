# Multi-stage Dockerfile for Yuva Attire E-Commerce
FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy client package files and build React frontend
COPY client/package*.json ./client/
RUN npm --prefix client ci

COPY client/ ./client/
RUN npm --prefix client run build

# Copy server files
COPY server/ ./server/

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app /app

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server/index.js"]
