import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL?.trim() || "file:./db/custom.db"

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
