FROM node:24-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 3000

# Sincronizar el esquema de la base de datos, aplicar datos semilla e iniciar en modo dev
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run dev"]

