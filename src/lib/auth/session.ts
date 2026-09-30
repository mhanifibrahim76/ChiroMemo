import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ensureAppUser } from "@/lib/users";

/**
 * Returns the signed-in application user, or redirects to the login page.
 *
 * `getClaims()` verifies the access token signature, so this is a real
 * authorization check and not a trusted cookie read. The Proxy redirects
 * unauthenticated visitors too, but every protected page must call this as
 * well: the Proxy can be bypassed by calling a Server Action directly.
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  return ensureAppUser({
    id: claims.sub,
    email: claims.email ?? null,
  });
}

/**
 * Only allows redirects to local paths, so a crafted `redirectTo` value cannot
 * be used to bounce the user to another site after signing in.
 */
export function safeRedirectPath(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
