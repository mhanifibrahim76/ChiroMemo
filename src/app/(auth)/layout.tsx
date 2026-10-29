import Image from "next/image";
import Link from "next/link";
import { ChiroMemoLogo } from "@/components/brand/chiromemo-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#1C1917] selection:bg-[#166534]/15 selection:text-[#166534]">
      {/* Top Editorial Bar */}
      <header className="h-14 shrink-0 border-b border-[#E5DEC9] bg-[#FAF8F4]/95 backdrop-blur-xs">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center">
            <ChiroMemoLogo size="sm" />
          </Link>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[#1C1917]/70">
            <span className="hidden sm:inline">STUDENT ACCESS PORTAL</span>
            <Link href="/" className="text-[#166534] font-medium hover:underline underline-offset-4">
              ← Return Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Grid (100dvh minus header) */}
      <main className="flex-1 flex flex-col lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden">
        <div className="mx-auto flex-1 min-h-0 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
          {/* Left Column (5 cols): The Quiet Reading Room Canvas */}
          <section className="relative lg:col-span-5 min-h-0 flex flex-col justify-between bg-[#F7EEDB] border-b lg:border-b-0 border-[#E5DEC9] px-6 py-8 lg:px-10 lg:py-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#166534]">
              PORTAL // THE QUIET ROOM
            </div>

            <div className="relative flex-1 min-h-[280px] lg:min-h-0 my-auto w-full flex items-center justify-center py-4">
              <Image
                src="/illustrations/auth-library-window.jpg"
                alt="Arched university library window overlooking autumn trees with an open journal and green study lamp"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                priority
                className="object-contain"
              />
            </div>

            <div className="space-y-3 shrink-0 border-t border-[#E5DEC9] pt-4">
              <blockquote className="font-serif italic text-base lg:text-lg text-[#1C1917]/85 leading-snug">
                &ldquo;Knowledge becomes permanent only when organized with deliberate calm.&rdquo;
              </blockquote>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                <span>FIG. 3.1 — THE READING ROOM</span>
                <span>PLATE IV</span>
              </div>
            </div>
          </section>

          {/* Right Column (7 cols): Editorial Form Pane */}
          <section className="relative lg:col-span-7 min-h-0 flex flex-col justify-between px-6 py-8 lg:px-12 lg:py-12 bg-[#FAF8F4] overflow-y-auto">
            <div className="w-full max-w-md mx-auto my-auto py-6">
              {children}
            </div>

            <footer className="w-full shrink-0 border-t border-[#E5DEC9] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#1C1917]/60">
              <span>SINGLE-USER ACADEMIC PLKMS</span>
              <span>ROW-LEVEL SECURITY (RLS) PROTECTED</span>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}
