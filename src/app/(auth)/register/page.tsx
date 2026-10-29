import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-[#E5DEC9] pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
          STUDENT REGISTRATION
        </span>
        <h1 className="font-serif font-normal text-3xl sm:text-4xl tracking-[-0.03em] leading-tight text-[#1C1917]">
          Create your study <em className="italic text-[#166534]">desk</em>.
        </h1>
        <p className="text-xs sm:text-sm text-[#1C1917]/70 leading-relaxed">
          Open your private, distraction-free semester notebook in under a minute.
        </p>
      </div>

      {/* Form Content */}
      <div className="pt-2">
        <RegisterForm />
      </div>

      {/* Footer Switcher */}
      <div className="border-t border-[#E5DEC9] pt-4 flex items-center justify-between text-xs">
        <span className="text-[#1C1917]/70">Already have an account?</span>
        <Link
          href="/login"
          className="font-medium text-[#166534] hover:underline underline-offset-4"
        >
          Sign in →
        </Link>
      </div>
    </div>
  );
}
