import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Protected placeholder. It only proves that an authenticated user can reach the
 * application area; the real dashboard is built in Phase 8.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary">Phase 3 · Authentication</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          You are signed in. Dashboard features arrive in Phase 8.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signed-in user</CardTitle>
          <CardDescription>
            The identifiers below match the Supabase Auth user, which is the source of truth
            for authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user.name ?? "—"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email ?? "—"}</dd>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="font-mono break-all">{user.id}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
