import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "@/lib/env";

/** Route prefixes that require a signed-in user. Extend as features are added. */
const PROTECTED_PREFIXES = ["/dashboard", "/goals"];

/** Pages that a signed-in user has no reason to see. */
const AUTH_ROUTES = ["/login", "/register"];

/**
 * Refreshes the Supabase session and guards the protected routes.
 *
 * Next.js 16 replaced `middleware.ts` with `proxy.ts`; a file named
 * `middleware.ts` is never called, which would stop token refreshes and sign
 * users out.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          // Makes the refreshed token visible to the Server Components below.
          request.cookies.set(name, value);
        }

        supabaseResponse = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        // Responses that carry auth cookies must not be cached by a CDN.
        for (const [name, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(name, value);
        }
      },
    },
  });

  // `getClaims()` verifies the access token signature. `getSession()` only
  // reads the cookie and must not be trusted for authorization.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (isSignedIn) {
    // A response that belongs to a signed-in user must never be stored by a CDN
    // or cache, otherwise it could be replayed to somebody else.
    supabaseResponse.headers.set("cache-control", "private, no-store");
  }

  if (!isSignedIn && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirectTo", pathname);

    return withAuthCookies(NextResponse.redirect(loginUrl), supabaseResponse);
  }

  if (isSignedIn && AUTH_ROUTES.includes(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";

    return withAuthCookies(NextResponse.redirect(dashboardUrl), supabaseResponse);
  }

  return supabaseResponse;
}

/** Carries refreshed cookies and cache headers onto a different response. */
function withAuthCookies(response: NextResponse, supabaseResponse: NextResponse) {
  for (const { name, value } of supabaseResponse.cookies.getAll()) {
    response.cookies.set(name, value);
  }

  for (const name of ["cache-control", "expires", "pragma"]) {
    const value = supabaseResponse.headers.get(name);
    if (value) {
      response.headers.set(name, value);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and route handlers. Supabase is not used
     * by those, and running the Proxy on them would only slow the request down.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
