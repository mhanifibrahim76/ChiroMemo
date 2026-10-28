"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";

export async function refreshRecommendationsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUser();
    revalidatePath("/recommendations");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to refresh recommendations";
    return { success: false, error: message };
  }
}

