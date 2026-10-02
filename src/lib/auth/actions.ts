"use server";

import { redirect } from "next/navigation";

import { safeRedirectPath } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, loginSchema, registerSchema } from "@/lib/validations/auth";

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error: "Confirm your email address first. Open the confirmation link we sent you, then sign in.",
      };
    }

    // Deliberately vague: never reveal whether the email exists.
    return { error: "Invalid email or password." };
  }

  // Outside any try/catch: redirect() works by throwing.
  redirect(safeRedirectPath(formData.get("redirectTo")?.toString() ?? null));
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }

    return { error: "We could not create your account. Please try again." };
  }

  if (!data.session) {
    // Email confirmation is enabled: there is no session yet, so the caller is
    // not authenticated and RLS would reject an insert into `public.users`. The
    // application row is created lazily by `requireUser()` on the first
    // authenticated request instead, which also keeps `name` intact because it is
    // read back from the user's Auth metadata rather than re-submitted.
    return {
      message: "Almost done. Check your inbox to confirm your email address, then sign in.",
    };
  }

  // A session exists, so the redirect below leads straight to a protected page
  // whose layout calls `requireUser()`. That is where the application row is
  // created, so it is not duplicated here.
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
