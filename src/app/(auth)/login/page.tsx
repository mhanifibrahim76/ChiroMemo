import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === "string" ? params.redirectTo : undefined;

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-[#E5DEC9] pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
          STUDENT AUTHENTICATION
        </span>
        <h1 className="font-serif font-normal text-3xl sm:text-4xl tracking-[-0.03em] leading-tight text-[#1C1917]">
          Sign in to your <em className="italic text-[#166534]">workspace</em>.
        </h1>
        <p className="text-xs sm:text-sm text-[#1C1917]/70 leading-relaxed">
          Welcome back. Enter your student credentials to resume your courses.
        </p>
      </div>

      {/* Form Content */}
      <div className="pt-2">
        <LoginForm redirectTo={redirectTo} />
      </div>

      {/* Footer Switcher */}
      <div className="border-t border-[#E5DEC9] pt-4 flex items-center justify-between text-xs">
        <span className="text-[#1C1917]/70">No study account yet?</span>
        <Link
          href="/register"
          className="font-medium text-[#166534] hover:underline underline-offset-4"
        >
          Create account →
        </Link>
      </div>
    </div>
  );
}
