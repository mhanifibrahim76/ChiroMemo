import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type AppUserInput = {
  /** Supabase Auth user id. This is also the primary key of the app user. */
  id: string;
  email?: string | null;
  name?: string | null;
};

/** The columns callers depend on, mirroring the `public.users` table. */
export type AppUser = {
  id: string;
  email: string | null;
  name: string | null;
};

/**
 * Ensures the application-level `public.users` row exists for a Supabase Auth
 * user, then returns it.
 *
 * The row is keyed by the Supabase Auth id, so the two ids can never diverge and
 * no second UUID is generated.
 *
 * `ignoreDuplicates: true` maps to `ON CONFLICT DO NOTHING`, so an existing row
 * is left untouched: repeated calls (for example on every page load) neither
 * create a duplicate row nor overwrite data the user has already edited.
 *
 * `defaultToNull: false` is required. Without it PostgREST fills the omitted
 * `created_at` / `updated_at` with NULL instead of using the column default of
 * `now()`, which would violate their NOT NULL constraint.
 *
 * The upsert response is deliberately not used: on a conflict `DO NOTHING`
 * returns no row, so the row is read back with a separate select.
 *
 * The request is made with the signed-in user's session, so `users_insert_own`
 * and `users_select_own` scope it to `auth.uid()`. Callers must therefore pass
 * an id taken from a verified auth context, never from form or URL input.
 */
export const ensureAppUser = cache(async (input: AppUserInput): Promise<AppUser> => {
  const supabase = await createClient();

  const { error: upsertError } = await supabase
    .from("users")
    .upsert(
      {
        id: input.id,
        email: input.email ?? null,
        name: input.name ?? null,
      },
      { onConflict: "id", ignoreDuplicates: true, defaultToNull: false },
    );

  if (upsertError) {
    throw new Error(`Could not create the application user: ${upsertError.message}`);
  }

  const { data, error: selectError } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("id", input.id)
    .single();

  if (selectError) {
    throw new Error(`Could not read the application user: ${selectError.message}`);
  }

  return data;
});
