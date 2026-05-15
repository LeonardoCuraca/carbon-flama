import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: pg.Pool | undefined;
}

const pool = globalThis.pgPool ?? new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Limitar conexiones para desarrollo
  idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== "production") globalThis.pgPool = pool;

const adapter = new PrismaPg(pool);
const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
