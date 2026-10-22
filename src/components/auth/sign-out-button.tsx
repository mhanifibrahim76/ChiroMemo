"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

