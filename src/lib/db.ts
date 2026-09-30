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

// The client is created on first use, not at import time, so that importing a
// server module never requires a live database. This keeps `next build` working
// without database credentials and defers the configuration error to the first
// query.
const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
};

/** Returns the single shared Prisma client for this process. */
export function getPrismaClient() {
  if (!globalForPrisma.prismaClient) {
    // Reused across hot reloads in development, otherwise every reload would
    // open a new connection pool.
    globalForPrisma.prismaClient = createPrismaClient();
  }

  return globalForPrisma.prismaClient;
}
