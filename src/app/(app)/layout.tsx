import Link from "next/link";
import {
  LayoutDashboard,
  Target,
  Map,
  BookOpen,
  FileText,
  Sparkles,
} from "lucide-react";

import { logoutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // The Proxy already redirects unauthenticated visitors, but the check is
  // repeated here because the Proxy alone is not a security boundary.
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold text-base tracking-tight">
            ChiroMemo
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/goals"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Target className="h-4 w-4" />
              Goals
            </Link>
            <Link
              href="/roadmaps"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Map className="h-4 w-4" />
              Roadmaps
            </Link>
            <Link
              href="/resources"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Resources
            </Link>
            <Link
              href="/notes"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-4 w-4" />
              Notes
            </Link>
            <Link
              href="/summaries"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Summaries
            </Link>
            <span className="text-muted-foreground text-sm">{user.email}</span>
            <form action={logoutAction}>
              <SignOutButton />
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
