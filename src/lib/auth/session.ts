import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ensureAppUser } from "@/lib/users";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Returns the signed-in application user, or redirects to the login page.
 *
 * `getClaims()` verifies the access token signature, so this is a real
 * authorization check and not a trusted cookie read. The Proxy redirects
 * unauthenticated visitors too, but every protected page must call this as
 * well: the Proxy can be bypassed by calling a Server Action directly.
 *
 * Memoized per-request with React `cache()` so repeated calls in layout, page,
 * and data-access layers within the same render pass run the remote checks once.
 *
 * The application row is created here rather than during registration, because
 * this is the first point at which the caller is authenticated and RLS applies.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  try {
    return await ensureAppUser({
      id: claims.sub,
      email: claims.email ?? null,
      name: await resolveName(supabase, claims.user_metadata?.name),
    });
  } catch {
    redirect("/login");
  }
});

/**
 * Returns the user's name from the verified auth context.
 *
 * `user_metadata` is an optional JWT claim, so the value is read from the token
 * first because that costs no network round trip. When the token does not carry
 * it, the name is fetched from the Auth server so that a lazily created
 * `public.users` row is not left without one.
 *
 * The name is only used when the row is created: `ensureAppUser` never
 * overwrites an existing row.
 */
async function resolveName(
  supabase: ServerSupabaseClient,
  nameFromClaims: unknown,
): Promise<string | null> {
  if (typeof nameFromClaims === "string" && nameFromClaims.length > 0) {
    return nameFromClaims;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Could not read the authenticated user's metadata: ${error.message}`);
  }

  const name = data.user.user_metadata?.name;

  return typeof name === "string" && name.length > 0 ? name : null;
}

export { safeRedirectPath } from "./redirect";
