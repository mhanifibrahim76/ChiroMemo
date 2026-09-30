import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 does not load env files by itself. Load the same files Next.js uses
// so that one `.env.local` is enough for both. Real environment variables
// (Vercel, CI) always win because dotenv never overrides them.
config({ path: [".env.local", ".env"], quiet: true });

/**
 * Prisma 7 configuration.
 *
 * Prisma 7 no longer reads `.env` automatically and no longer accepts `url`
 * inside the `datasource` block of `prisma/schema.prisma`, so the connection
 * string is provided here. The CLI commands that need it are `migrate`,
 * `db push` and `db pull`; `prisma generate` works without a connection.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase Postgres. Use the direct connection (or the session pooler),
    // not the transaction pooler, for migrations.
    url: process.env.DATABASE_URL,
  },
});
