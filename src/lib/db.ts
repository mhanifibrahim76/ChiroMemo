import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { getServerEnv } from "@/lib/env";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  // Prisma 7 requires a driver adapter; the connection string is passed here
  // instead of in the Prisma schema.
  const adapter = new PrismaPg({ connectionString: getServerEnv().DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Reuse one client across hot reloads in development, otherwise every reload
// would open a new connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
