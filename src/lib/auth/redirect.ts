/**
 * Only allows redirects to local paths, so a crafted `redirectTo` value cannot
 * be used to bounce the user to another site after signing in.
 */
export function safeRedirectPath(value: string | null, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

