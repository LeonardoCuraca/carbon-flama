# Stage 1: Build
FROM node:24-slim AS builder
WORKDIR /app

# Instalar dependencias necesarias para Prisma y compilación
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.server.json ./tsconfig.server.json

# Exponer el puerto del servidor personalizado
EXPOSE 3000

# Ejecutar el servidor personalizado en producción
CMD ["npm", "start"]
