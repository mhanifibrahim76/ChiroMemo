import Link from "next/link";
import { ChiroMemoLogo } from "@/components/brand/chiromemo-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/">
            <ChiroMemoLogo size="lg" />
          </Link>
          <p className="text-muted-foreground text-sm">
            Your personal learning and knowledge management system.
          </p>
        </div>
        {children}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
