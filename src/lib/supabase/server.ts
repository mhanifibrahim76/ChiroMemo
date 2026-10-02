import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * A new client is created for every request because the session lives in the
 * request cookies. Token refreshes are written back through `setAll`.
 *
 * The `Database` generic is the one generated into `database.types.ts`, so table
 * and enum names are checked at compile time. `@supabase/ssr` takes a schema
 * name as its second generic and already defaults to `public`, which is the only
 * schema this app queries. This adds type information only; the request
 * behaviour is unchanged.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only and
          // response headers cannot be set. The Proxy refreshes the session
          // and applies the anti-caching headers on every request.
        }
      },
    },
  });
}
