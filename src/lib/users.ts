import "server-only";

import { getPrismaClient } from "@/lib/db";

type AppUserInput = {
  /** Supabase Auth user id. This is also the primary key of the app user. */
  id: string;
  email?: string | null;
  name?: string | null;
};

/**
 * Creates the application-level `public.User` row for a Supabase Auth user.
 *
 * The row is keyed by the Supabase Auth id, so the two ids can never diverge
 * and no second UUID is generated. `upsert` keeps the call idempotent: repeated
 * calls (for example on every page load) neither create a duplicate row nor
 * overwrite data the user has already edited.
 */
export async function ensureAppUser(input: AppUserInput) {
  return getPrismaClient().user.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email ?? null,
      name: input.name ?? null,
    },
    update: {},
  });
}
