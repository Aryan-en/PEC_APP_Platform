# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# IMPORTANT: generate Prisma Client
RUN npx prisma generate

# IMPORTANT: build NestJS
RUN npm run build
RUN ls -la /app/dist
RUN ls -la /app/src

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/prisma ./prisma

# IMPORTANT: generate Prisma Client again for production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
RUN ls -la /app/dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
