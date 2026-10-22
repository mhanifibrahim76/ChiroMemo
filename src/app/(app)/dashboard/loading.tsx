import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
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
          <div className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-72" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

