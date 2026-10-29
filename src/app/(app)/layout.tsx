import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ChiroMemoLogo } from "@/components/brand/chiromemo-logo";
import { WorkspaceNavbar } from "@/components/layout/workspace-navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // The Proxy already redirects unauthenticated visitors, but the check is
  // repeated here because the Proxy alone is not a security boundary.
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F4] text-[#1C1917] selection:bg-[#166534]/15 selection:text-[#166534]">
      {/* Sticky Editorial Workspace Header (h-14 / 56px) */}
      <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-[#E5DEC9] bg-[#FAF8F4]/95 backdrop-blur-xs">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo & Identity */}
          <Link href="/dashboard" className="inline-flex items-center shrink-0">
            <ChiroMemoLogo size="sm" />
          </Link>

          {/* Interactive Navigation with Active Page Indicators */}
          <WorkspaceNavbar />

          {/* User Session & Sign Out */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline-block font-mono text-[11px] text-[#1C1917]/60 max-w-[160px] truncate">
              {user.email}
            </span>
            <form action={logoutAction}>
              <SignOutButton />
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {children}
      </main>

      {/* Workspace Hairline Footer */}
      <footer className="border-t border-[#E5DEC9] bg-[#FAF8F4] py-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[#1C1917]/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <span>CHIROMEMO ACADEMIC WORKSPACE</span>
          <span>RLS PROTECTED · SINGLE STUDENT</span>
        </div>
      </footer>
    </div>
  );
}
