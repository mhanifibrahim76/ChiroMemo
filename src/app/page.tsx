import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChiroMemoLogo } from "@/components/brand/chiromemo-logo";

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 select-none font-mono text-xs leading-none text-[#1C1917]/30 ${className ?? ""}`}
    >
      +
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#1C1917] selection:bg-[#166534]/15 selection:text-[#166534]">
      {/* Sticky Editorial Navigation Header (h-14 / 3.5rem = 56px) */}
      <header className="sticky top-0 z-40 h-14 w-full border-b border-[#E5DEC9] bg-[#FAF8F4]/95 backdrop-blur-xs">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center">
            <ChiroMemoLogo size="sm" />
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <a
              href="#chapter-01"
              className="hidden md:inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              01 / Direction
            </a>
            <a
              href="#chapter-02"
              className="hidden md:inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              02 / Synthesis
            </a>
            <a
              href="#chapter-03"
              className="hidden md:inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              03 / Reading Room
            </a>
            <Link
              href="/login"
              className="px-2 py-1 text-sm font-medium text-[#1C1917] hover:underline underline-offset-4"
            >
              Sign in
            </Link>
            <Button asChild size="sm" className="h-8 rounded-sm px-4 text-xs font-medium shadow-none">
              <Link href="/register">Open notebook</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* =====================================================================
            SCREEN 1: HERO — EXACT 1 VIEWPORT HEIGHT (calc(100dvh - 3.5rem))
           ===================================================================== */}
        <section className="relative flex flex-col justify-between bg-[#F7EEDB] border-b border-[#E5DEC9] lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden">
          {/* Top Editorial Masthead */}
          <div className="w-full shrink-0 border-b border-[#E5DEC9]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 lg:px-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/70">
              <span>VOL. I — PERSONAL KNOWLEDGE SYSTEM</span>
              <span className="hidden sm:inline">UNIVERSITY ACADEMIC EDITION</span>
            </div>
          </div>

          {/* Main 5:7 Exposed Hairline Hero Grid */}
          <div className="mx-auto flex-1 min-h-0 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
            {/* Left 5 Columns: Align-Bottom Editorial Typography */}
            <div className="relative lg:col-span-5 min-h-0 flex flex-col justify-between px-6 py-6 lg:px-10 lg:py-7">
              <Crosshair className="hidden lg:block -right-[4.5px] top-5" />

              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#166534]">
                INDEX 00 // THE QUIET DESK
              </div>

              <div className="space-y-4 pt-6 lg:pt-0">
                <h1 className="font-serif font-normal text-4xl sm:text-5xl xl:text-[3.5rem] tracking-[-0.03em] leading-[1.05] text-[#1C1917]">
                  A structured map, <em className="italic text-[#166534]">not</em> a scattered pile of notes.
                </h1>

                <p className="text-sm xl:text-[15px] text-[#1C1917]/80 leading-[1.68]">
                  University syllabi, lecture slides, and textbook PDFs lose their value when buried
                  across random folders. ChiroMemo binds your semester goals, sequential roadmaps,
                  and study notes into one calm manuscript.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    asChild
                    size="lg"
                    className="h-10 rounded-sm bg-[#166534] px-6 text-sm font-medium text-[#FAF8F4] shadow-none hover:bg-[#14532d] gap-2"
                  >
                    <Link href="/register">
                      <span>Begin your semester</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-10 rounded-sm border-[#1C1917]/25 bg-transparent px-5 text-sm font-medium text-[#1C1917] shadow-none hover:bg-[#FAF8F4] hover:border-[#1C1917]"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>

                <div className="border-t border-[#E5DEC9] pt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#1C1917]/60">
                  SINGLE-STUDENT RLS WORKSPACE · ZERO SOCIAL NOISE · GEMINI SYNTHESIS
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Seamless Study Desk Illustration */}
            <div className="relative lg:col-span-7 min-h-0 flex flex-col justify-between border-t border-[#E5DEC9] lg:border-t-0 px-6 py-6 lg:px-10 lg:py-7 bg-[#F7EEDB]">
              <div className="relative flex-1 min-h-[260px] lg:min-h-0 w-full">
                <Image
                  src="/illustrations/hero-study-desk.jpg"
                  alt="Editorial ink illustration of a student study desk with an open notebook transforming into structured roadmap milestones"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  priority
                  className="object-contain"
                />
              </div>

              <div className="mt-4 shrink-0 flex items-center justify-between border-t border-[#E5DEC9] pt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                <span>FIG. 0.1 — STRUCTURED STUDY DESK &amp; ROADMAP NODES</span>
                <span>SCALE 1:1</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SCREEN 2: CHAPTER 01 — EXACT 1 VIEWPORT HEIGHT (calc(100dvh - 3.5rem))
           ===================================================================== */}
        <section
          id="chapter-01"
          className="scroll-mt-14 relative flex flex-col bg-[#FAF8F4] border-b border-[#E5DEC9] lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden"
        >
          {/* Chapter Masthead Strip */}
          <div className="w-full shrink-0 border-b border-[#E5DEC9]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 lg:px-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/70">
              <span>CHAPTER 01 // DIRECTION &amp; CONSISTENCY</span>
              <span className="hidden sm:inline">SYLLABUS DECONSTRUCTION</span>
            </div>
          </div>

          {/* 2 : 4 : 6 Asymmetric Grid */}
          <div className="mx-auto flex-1 min-h-0 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
            {/* Col 1 (2 cols): Giant Chapter Index Number */}
            <div className="relative lg:col-span-2 min-h-0 flex lg:flex-col justify-between items-baseline px-6 py-5 lg:px-8 lg:py-7 border-b lg:border-b-0 border-[#E5DEC9]">
              <Crosshair className="hidden lg:block -right-[4.5px] bottom-6" />
              <span className="font-serif italic font-light text-6xl xl:text-7xl tracking-[-0.04em] text-[#1C1917]/20 leading-none">
                01
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/55">
                14-WEEK ARC
              </span>
            </div>

            {/* Col 2 (4 cols): Sharp Narrative & Numbered Sub-points */}
            <div className="relative lg:col-span-4 min-h-0 flex flex-col justify-between divide-y divide-[#E5DEC9] border-b lg:border-b-0 border-[#E5DEC9]">
              <Crosshair className="hidden lg:block -right-[4.5px] top-8" />

              <div className="p-6 lg:px-8 lg:py-6 space-y-3">
                <h2 className="font-serif font-normal text-3xl sm:text-4xl xl:text-[2.6rem] tracking-[-0.03em] leading-[1.08] text-[#1C1917]">
                  Break a heavy syllabus into <em className="italic text-[#166534]">clear</em> weekly steps.
                </h2>
                <p className="text-sm text-[#1C1917]/75 leading-[1.65]">
                  Instead of confronting midterms and final projects all at once, map every course
                  into an ordered sequence you can calmly complete week by week.
                </p>
              </div>

              <div className="divide-y divide-[#E5DEC9]">
                <div className="px-6 py-4 lg:px-8 lg:py-5 space-y-1.5 transition-colors hover:bg-[#F7EEDB]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
                    01.1 — LEARNING GOALS &amp; ROADMAPS
                  </div>
                  <h3 className="text-sm font-semibold text-[#1C1917]">
                    Prioritize courses and sequential milestones
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#1C1917]/75 leading-[1.6]">
                    Assign target exam dates, rank overlapping subjects by priority, and attach
                    required readings directly to each roadmap step.
                  </p>
                </div>

                <div className="px-6 py-4 lg:px-8 lg:py-5 space-y-1.5 transition-colors hover:bg-[#F7EEDB]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D97706]">
                    01.2 — MEASURED STUDY RHYTHM
                  </div>
                  <h3 className="text-sm font-semibold text-[#1C1917]">
                    See genuine completion, not guesswork
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#1C1917]/75 leading-[1.6]">
                    Every finished roadmap node and study session updates your subject completion
                    percentage and logs your recent academic momentum.
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3 (6 cols): Seamless #F7EEDB Illustration Canvases (50% / 50% vertical split) */}
            <div className="lg:col-span-6 min-h-0 flex flex-col divide-y divide-[#E5DEC9] bg-[#F7EEDB]">
              {/* Top Plate: Compass & Roadmap */}
              <div className="flex-1 min-h-0 flex flex-col justify-between px-6 py-4 lg:px-8 lg:py-5">
                <div className="relative flex-1 min-h-[180px] lg:min-h-0 w-full">
                  <Image
                    src="/illustrations/goals-roadmap-compass.jpg"
                    alt="Vintage brass compass beside an unrolled milestone map"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <p className="pt-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                  FIG. 1.1 — SEQUENTIAL ROADMAP COMPASS &amp; COURSE MILESTONES
                </p>
              </div>

              {/* Bottom Plate: Botanical Progress & Hourglass */}
              <div className="flex-1 min-h-0 flex flex-col justify-between px-6 py-4 lg:px-8 lg:py-5">
                <div className="relative flex-1 min-h-[180px] lg:min-h-0 w-full">
                  <Image
                    src="/illustrations/dashboard-progress.jpg"
                    alt="Hourglass, textbooks, and ascending botanical milestone blocks"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <p className="pt-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                  FIG. 1.2 — CONSISTENCY HOURGLASS &amp; CUMULATIVE PROGRESS
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SCREEN 3: CHAPTER 02 — EXACT 1 VIEWPORT HEIGHT (calc(100dvh - 3.5rem))
           ===================================================================== */}
        <section
          id="chapter-02"
          className="scroll-mt-14 relative flex flex-col justify-between bg-[#166534] text-[#FAF8F4] border-b border-[#E5DEC9] lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden"
        >
          {/* Chapter Masthead on Deep Forest */}
          <div className="w-full shrink-0 border-b border-[#FAF8F4]/15">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 lg:px-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FAF8F4]/70">
              <span>CHAPTER 02 // KNOWLEDGE &amp; AI SYNTHESIS</span>
              <span className="hidden sm:inline">MANUSCRIPT &amp; RETRIEVAL</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl flex-1 min-h-0 flex flex-col justify-between px-6 py-6 lg:px-10 lg:py-6 gap-5">
            {/* Compact Editorial Spread Header */}
            <div className="shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-8 flex items-baseline gap-4">
                <span className="font-serif italic font-light text-4xl xl:text-5xl text-[#FAF8F4]/35 leading-none shrink-0">
                  02
                </span>
                <h2 className="font-serif font-normal text-3xl sm:text-4xl xl:text-[2.75rem] tracking-[-0.03em] leading-[1.06] text-[#FAF8F4]">
                  Distill dense PDFs into <em className="italic text-[#F7EEDB]">searchable</em> understanding.
                </h2>
              </div>
              <p className="lg:col-span-4 text-xs xl:text-[13.5px] text-[#FAF8F4]/80 leading-[1.6]">
                Read uploaded papers alongside a live Markdown notebook, extract key exam points
                with Gemini, and retrieve any concept across your archive in plain language.
              </p>
            </div>

            {/* Staggered Open-Book Manuscript Sheets Fitting Inside Remaining Height */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Manuscript Sheet (Aligned Top: lg:mb-6) */}
              <article className="lg:col-span-6 lg:mb-6 min-h-0 flex flex-col bg-[#F7EEDB] text-[#1C1917] rounded-none border border-[#1C1917]/15">
                <div className="flex-1 min-h-[180px] lg:min-h-0 px-6 pt-4 pb-3 border-b border-[#E5DEC9] flex flex-col justify-between">
                  <div className="relative flex-1 min-h-[140px] lg:min-h-0 w-full">
                    <Image
                      src="/illustrations/notes-resources-journal.jpg"
                      alt="Open dot-grid manuscript notebook with fountain pen and tied academic journals"
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="pt-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                    FIG. 2.1 — DOT-GRID MANUSCRIPT &amp; PDF ARCHIVE
                  </div>
                </div>

                <div className="shrink-0 px-6 py-4 space-y-1.5 bg-[#FAF8F4]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#166534]">
                    02.1 — TWO-PANE NOTES &amp; PDF SUMMARIES
                  </div>
                  <h3 className="font-serif font-normal text-xl xl:text-2xl tracking-[-0.02em] text-[#1C1917]">
                    Keep primary sources beside your own words
                  </h3>
                  <p className="text-xs xl:text-[13px] text-[#1C1917]/75 leading-[1.55]">
                    Upload lecture PDFs into private storage, generate structured Gemini summaries
                    with key takeaways, and write tagged Markdown notes linked directly to each document.
                  </p>
                </div>
              </article>

              {/* Right Manuscript Sheet (Staggered Lower Offset: lg:mt-6) */}
              <article className="lg:col-span-6 lg:mt-6 min-h-0 flex flex-col bg-[#F7EEDB] text-[#1C1917] rounded-none border border-[#1C1917]/15">
                <div className="flex-1 min-h-[180px] lg:min-h-0 px-6 pt-4 pb-3 border-b border-[#E5DEC9] flex flex-col justify-between">
                  <div className="relative flex-1 min-h-[140px] lg:min-h-0 w-full">
                    <Image
                      src="/illustrations/ai-search-discovery.jpg"
                      alt="Magnifying glass, glowing lantern, and constellation nodes emerging from an open book"
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="pt-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                    FIG. 2.2 — SEMANTIC KNOWLEDGE CONSTELLATION
                  </div>
                </div>

                <div className="shrink-0 px-6 py-4 space-y-1.5 bg-[#FAF8F4]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D97706]">
                    02.2 — INTELLIGENT SEARCH &amp; RECOMMENDATIONS
                  </div>
                  <h3 className="font-serif font-normal text-xl xl:text-2xl tracking-[-0.02em] text-[#1C1917]">
                    Query every course at once in natural language
                  </h3>
                  <p className="text-xs xl:text-[13px] text-[#1C1917]/75 leading-[1.55]">
                    Ask a question without remembering filenames. ChiroMemo searches your notes,
                    summaries, and goals simultaneously—synthesizing answers and suggesting next reviews.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SCREEN 4: CHAPTER 03 / COLOPHON — EXACT 1 VIEWPORT HEIGHT (calc(100dvh - 3.5rem))
           ===================================================================== */}
        <section
          id="chapter-03"
          className="scroll-mt-14 relative flex flex-col justify-between bg-[#FAF8F4] lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden"
        >
          {/* Chapter 03 Masthead */}
          <div className="w-full shrink-0 border-b border-[#E5DEC9]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 lg:px-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/70">
              <span>CHAPTER 03 // THE READING ROOM</span>
              <span className="hidden sm:inline">STUDENT REGISTRATION</span>
            </div>
          </div>

          {/* 7 : 5 Exposed Hairline Split */}
          <div className="mx-auto flex-1 min-h-0 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
            {/* Left 7 Cols: Closing Editorial Invitation */}
            <div className="relative lg:col-span-7 min-h-0 flex flex-col justify-between px-6 py-8 lg:px-10 lg:py-8">
              <Crosshair className="hidden lg:block -right-[4.5px] top-8" />

              <span className="font-serif italic font-light text-5xl xl:text-6xl text-[#1C1917]/20 leading-none">
                03
              </span>

              <div className="space-y-4 my-auto max-w-xl">
                <h2 className="font-serif font-normal text-4xl sm:text-5xl xl:text-[3.25rem] tracking-[-0.03em] leading-[1.06] text-[#1C1917]">
                  Step into a <em className="italic text-[#166534]">quieter</em> semester.
                </h2>
                <p className="text-sm xl:text-[15px] text-[#1C1917]/75 leading-[1.68]">
                  Your personal study room is ready. Create an account in under a minute, establish
                  your first course goal, and keep every lecture note where you can find it.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    asChild
                    size="lg"
                    className="h-10 rounded-sm bg-[#166534] px-6 text-sm font-medium text-[#FAF8F4] shadow-none hover:bg-[#14532d] gap-2"
                  >
                    <Link href="/register">
                      <span>Create student account</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-10 rounded-sm border-[#1C1917]/25 bg-transparent px-5 text-sm font-medium text-[#1C1917] shadow-none hover:bg-[#F7EEDB] hover:border-[#1C1917]"
                  >
                    <Link href="/login">Sign in to workspace</Link>
                  </Button>
                </div>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/55">
                BUILT FOR INDIVIDUAL UNIVERSITY SCHOLARSHIP
              </div>
            </div>

            {/* Right 5 Cols: Seamless Library Window Canvas */}
            <div className="lg:col-span-5 min-h-0 flex flex-col justify-between border-t lg:border-t-0 border-[#E5DEC9] bg-[#F7EEDB] px-6 py-6 lg:px-10 lg:py-6">
              <div className="relative flex-1 min-h-[260px] lg:min-h-0 w-full">
                <Image
                  src="/illustrations/auth-library-window.jpg"
                  alt="Arched university library window overlooking autumn trees with an open journal and green study lamp"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="pt-3 shrink-0 border-t border-[#E5DEC9] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                <span>FIG. 3.1 — THE QUIET READING ROOM</span>
                <span>ARCHIVE PLATE IV</span>
              </div>
            </div>
          </div>

          {/* Editorial Colophon Footer (Fits Inside Screen 4 Bottom) */}
          <footer className="w-full shrink-0 border-t border-[#E5DEC9] bg-[#FAF8F4] py-3.5">
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-6 lg:px-10">
              <div className="flex items-center gap-4">
                <ChiroMemoLogo size="sm" />
                <span className="hidden sm:inline text-[#E5DEC9]">|</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1C1917]/60">
                  PLKMS · PERSONAL LEARNING &amp; KNOWLEDGE SYSTEM
                </span>
              </div>

              <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.14em]">
                <Link href="/login" className="text-[#1C1917]/70 hover:text-[#1C1917] hover:underline underline-offset-4">
                  Sign In
                </Link>
                <Link href="/register" className="text-[#166534] font-semibold hover:underline underline-offset-4">
                  Register
                </Link>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
