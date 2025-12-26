# ---------- Stage 1: Builder ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy application source
COPY . .

# ---------- Stage 2: Runtime ----------
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app /app

EXPOSE 5000

CMD ["node", "server.js"]

