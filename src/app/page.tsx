import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const upcoming = [
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
            Authentication is ready. Sign in to reach the protected application area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {upcoming.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
