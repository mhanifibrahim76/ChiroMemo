"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components.
 *
 * Only public configuration is used here. The service-role key and the database
 * connection string must never be imported in browser code.
 *
 * `createBrowserClient` is a singleton, so calling this repeatedly returns the
 * same instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
