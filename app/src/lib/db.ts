import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Singleton pattern so hot-reload in `next dev` doesn't open a new SQLite handle per request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Local machine keeps using the plain SQLite file via better-sqlite3, unchanged. When deployed
// (Vercel has no writable local disk), TURSO_DATABASE_URL is set and we talk to the hosted
// libSQL database instead — same schema, same Prisma Client API either way.
function createClient() {
  if (process.env.TURSO_DATABASE_URL) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
