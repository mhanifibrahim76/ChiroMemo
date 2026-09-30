import Link from "next/link";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // The Proxy already redirects unauthenticated visitors, but the check is
  // repeated here because the Proxy alone is not a security boundary.
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold">
            ChiroMemo
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{user.email}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
