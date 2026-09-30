import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const upcoming = [
  "Authentication (Supabase Auth)",
  "Database schema (Prisma + Supabase Postgres)",
  "Learning goals",
  "Learning roadmaps",
  "Resources, notes, dashboard, AI features",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="space-y-2">
        <Badge variant="secondary">Phase 1 · Project foundation</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">ChiroMemo</h1>
        <p className="text-muted-foreground">
          Personal Learning and Knowledge Management System for university students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application status</CardTitle>
          <CardDescription>
            The project foundation is in place. Features are built phase by phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {upcoming.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
