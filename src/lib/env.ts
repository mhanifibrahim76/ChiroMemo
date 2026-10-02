import "server-only";

import { z } from "zod";

/**
 * Public Supabase configuration.
 *
 * These two variables are safe to use in the browser, but the browser reads them
 * directly from `process.env` because Next.js inlines `NEXT_PUBLIC_*` at build
 * time. This helper is the server-side, validated equivalent.
 */
const supabasePublicEnvSchema = z.object({
  url: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  anonKey: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

/** Server secrets. Never sent to the browser. */
const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

let supabasePublicEnv: z.infer<typeof supabasePublicEnvSchema> | undefined;
let serverEnv: z.infer<typeof serverEnvSchema> | undefined;

/**
 * Parsing is lazy and cached so that importing a server module does not fail
 * when an unrelated variable is not configured yet. The first call throws with
 * a readable message listing every missing or invalid variable.
 */
export function getSupabasePublicEnv() {
  if (!supabasePublicEnv) {
    supabasePublicEnv = supabasePublicEnvSchema.parse({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }

  return supabasePublicEnv;
}

export function getServerEnv() {
  if (!serverEnv) {
    serverEnv = serverEnvSchema.parse({
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }

  return serverEnv;
}
