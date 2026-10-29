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
      {/* Sticky Editorial Navigation Header (4rem / 64px) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E5DEC9] bg-[#FAF8F4]/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="inline-flex items-center">
            <ChiroMemoLogo size="md" />
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <a
              href="#chapter-01"
              className="hidden md:inline-block font-mono text-xs uppercase tracking-[0.14em] text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              01 / Direction
            </a>
            <a
              href="#chapter-02"
              className="hidden md:inline-block font-mono text-xs uppercase tracking-[0.14em] text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              02 / Synthesis
            </a>
            <Link
              href="/login"
              className="px-2 py-1 text-sm font-medium text-[#1C1917] hover:underline underline-offset-4"
            >
              Sign in
            </Link>
            <Button asChild size="sm" className="rounded-sm px-4 font-medium shadow-none">
              <Link href="/register">Open notebook</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* =====================================================================
            SCREEN 1: HERO — SEAMLESS WARM PAPER CANVAS (#F7EEDB)
           ===================================================================== */}
        <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#F7EEDB] border-b border-[#E5DEC9]">
          {/* Top Editorial Masthead */}
          <div className="w-full border-b border-[#E5DEC9]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 lg:px-10 font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C1917]/70">
              <span>VOL. I — PERSONAL KNOWLEDGE SYSTEM</span>
              <span className="hidden sm:inline">UNIVERSITY ACADEMIC EDITION</span>
            </div>
          </div>

          {/* Main 5:7 Exposed Hairline Hero Grid */}
          <div className="mx-auto flex-1 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
            {/* Left 5 Columns: Align-Bottom Editorial Typography */}
            <div className="relative lg:col-span-5 flex flex-col justify-between px-6 py-10 lg:px-10 lg:py-12">
              <Crosshair className="hidden lg:block -right-[4.5px] top-6" />

              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#166534]">
                INDEX 00 // THE QUIET DESK
              </div>

              <div className="space-y-6 pt-10 lg:pt-16">
                <h1 className="font-serif font-normal text-5xl sm:text-6xl lg:text-[4rem] tracking-[-0.03em] leading-[1.04] text-[#1C1917]">
                  A structured map, <em className="italic text-[#166534]">not</em> a scattered pile of notes.
                </h1>

                <p className="text-base text-[#1C1917]/80 leading-[1.75]">
                  University syllabi, lecture slides, and textbook PDFs lose their value when buried
                  across random folders. ChiroMemo binds your semester goals, sequential roadmaps,
                  and study notes into one calm manuscript.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-sm bg-[#166534] px-7 text-sm font-medium text-[#FAF8F4] shadow-none hover:bg-[#14532d] gap-2.5"
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
                    className="h-12 rounded-sm border-[#1C1917]/25 bg-transparent px-6 text-sm font-medium text-[#1C1917] shadow-none hover:bg-[#FAF8F4] hover:border-[#1C1917]"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>

                <div className="border-t border-[#E5DEC9] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#1C1917]/60">
                  SINGLE-STUDENT RLS WORKSPACE · ZERO SOCIAL NOISE · GEMINI SYNTHESIS
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Seamless Study Desk Illustration */}
            <div className="relative lg:col-span-7 flex flex-col justify-between border-t border-[#E5DEC9] lg:border-t-0 px-6 py-8 lg:px-10 lg:py-12 bg-[#F7EEDB]">
              <div className="my-auto flex items-center justify-center">
                <Image
                  src="/illustrations/hero-study-desk.jpg"
                  alt="Editorial ink illustration of a student study desk with an open notebook transforming into structured roadmap milestones"
                  width={1400}
                  height={840}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#E5DEC9] pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                <span>FIG. 0.1 — STRUCTURED STUDY DESK &amp; ROADMAP NODES</span>
                <span>SCALE 1:1</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SCREEN 2: CHAPTER 01 — ASYMMETRIC 2:4:6 EXPOSED HAIRLINE GRID
           ===================================================================== */}
        <section
          id="chapter-01"
          className="relative min-h-screen flex flex-col bg-[#FAF8F4] border-b border-[#E5DEC9]"
        >
          {/* Chapter Masthead Strip */}
          <div className="w-full border-b border-[#E5DEC9]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10 font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C1917]/70">
              <span>CHAPTER 01 // DIRECTION &amp; CONSISTENCY</span>
              <span className="hidden sm:inline">SYLLABUS DECONSTRUCTION</span>
            </div>
          </div>

          {/* 2 : 4 : 6 Asymmetric Grid */}
          <div className="mx-auto flex-1 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
            {/* Col 1 (2 cols): Giant Chapter Index Number */}
            <div className="relative lg:col-span-2 flex lg:flex-col justify-between items-baseline px-6 py-8 lg:px-8 lg:py-12 border-b lg:border-b-0 border-[#E5DEC9]">
              <Crosshair className="hidden lg:block -right-[4.5px] bottom-8" />
              <span className="font-serif italic font-light text-7xl lg:text-8xl tracking-[-0.04em] text-[#1C1917]/20 leading-none">
                01
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/55">
                14-WEEK ARC
              </span>
            </div>

            {/* Col 2 (4 cols): Sharp Narrative & Numbered Sub-points */}
            <div className="relative lg:col-span-4 flex flex-col justify-between divide-y divide-[#E5DEC9] border-b lg:border-b-0 border-[#E5DEC9]">
              <Crosshair className="hidden lg:block -right-[4.5px] top-10" />

              <div className="p-6 lg:p-10 space-y-5">
                <h2 className="font-serif font-normal text-4xl sm:text-5xl tracking-[-0.03em] leading-[1.08] text-[#1C1917]">
                  Break a heavy syllabus into <em className="italic text-[#166534]">clear</em> weekly steps.
                </h2>
                <p className="text-sm sm:text-base text-[#1C1917]/75 leading-[1.75]">
                  Instead of confronting midterms and final projects all at once, map every course
                  into an ordered sequence you can calmly complete week by week.
                </p>
              </div>

              <div className="divide-y divide-[#E5DEC9]">
                <div className="p-6 lg:p-8 space-y-2 transition-colors hover:bg-[#F7EEDB]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#166534]">
                    01.1 — LEARNING GOALS &amp; ROADMAPS
                  </div>
                  <h3 className="text-base font-semibold text-[#1C1917]">
                    Prioritize courses and sequential milestones
                  </h3>
                  <p className="text-sm text-[#1C1917]/75 leading-[1.75]">
                    Assign target exam dates, rank overlapping subjects by priority, and attach
                    required readings directly to each roadmap step.
                  </p>
                </div>

                <div className="p-6 lg:p-8 space-y-2 transition-colors hover:bg-[#F7EEDB]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#D97706]">
                    01.2 — MEASURED STUDY RHYTHM
                  </div>
                  <h3 className="text-base font-semibold text-[#1C1917]">
                    See genuine completion, not guesswork
                  </h3>
                  <p className="text-sm text-[#1C1917]/75 leading-[1.75]">
                    Every finished roadmap node and study session updates your subject completion
                    percentage and logs your recent academic momentum.
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3 (6 cols): Seamless #F7EEDB Illustration Canvases */}
            <div className="lg:col-span-6 flex flex-col divide-y divide-[#E5DEC9] bg-[#F7EEDB]">
              {/* Top Plate: Compass & Roadmap */}
              <div className="flex-1 flex flex-col justify-between p-6 lg:p-10">
                <div className="my-auto flex items-center justify-center py-2">
                  <Image
                    src="/illustrations/goals-roadmap-compass.jpg"
                    alt="Vintage brass compass beside an unrolled milestone map"
                    width={640}
                    height={480}
                    className="max-h-60 w-auto object-contain"
                  />
                </div>
                <p className="pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                  FIG. 1.1 — SEQUENTIAL ROADMAP COMPASS &amp; COURSE MILESTONES
                </p>
              </div>

              {/* Bottom Plate: Botanical Progress & Hourglass */}
              <div className="flex-1 flex flex-col justify-between p-6 lg:p-10">
                <div className="my-auto flex items-center justify-center py-2">
                  <Image
                    src="/illustrations/dashboard-progress.jpg"
                    alt="Hourglass, textbooks, and ascending botanical milestone blocks"
                    width={720}
                    height={480}
                    className="max-h-56 w-auto object-contain"
                  />
                </div>
                <p className="pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                  FIG. 1.2 — CONSISTENCY HOURGLASS &amp; CUMULATIVE PROGRESS
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SCREEN 3: CHAPTER 02 — DEEP FOREST EDITORIAL SPREAD (#166534)
           ===================================================================== */}
        <section
          id="chapter-02"
          className="relative min-h-screen flex flex-col justify-between bg-[#166534] text-[#FAF8F4] border-b border-[#E5DEC9]"
        >
          {/* Chapter Masthead on Deep Forest */}
          <div className="w-full border-b border-[#FAF8F4]/15">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10 font-mono text-[11px] uppercase tracking-[0.18em] text-[#FAF8F4]/70">
              <span>CHAPTER 02 // KNOWLEDGE &amp; AI SYNTHESIS</span>
              <span className="hidden sm:inline">MANUSCRIPT &amp; RETRIEVAL</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-14 lg:px-10 lg:py-20 space-y-12">
            {/* Editorial Spread Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-8 space-y-4">
                <span className="font-serif italic font-light text-5xl sm:text-6xl text-[#FAF8F4]/35 block leading-none">
                  02
                </span>
                <h2 className="font-serif font-normal text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.06] text-[#FAF8F4]">
                  Distill dense PDFs into <em className="italic text-[#F7EEDB]">searchable</em> understanding.
                </h2>
              </div>
              <p className="lg:col-span-4 text-sm sm:text-base text-[#FAF8F4]/80 leading-[1.75]">
                Read uploaded papers alongside a live Markdown notebook, extract key exam points
                with Gemini, and retrieve any concept across your entire archive in plain language.
              </p>
            </div>

            {/* Staggered Open-Book Manuscript Sheets (rounded-none, offset height) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Manuscript Sheet (Higher) */}
              <article className="lg:col-span-6 bg-[#F7EEDB] text-[#1C1917] rounded-none border border-[#1C1917]/15">
                <div className="p-6 sm:p-10 border-b border-[#E5DEC9] flex flex-col items-center">
                  <Image
                    src="/illustrations/notes-resources-journal.jpg"
                    alt="Open dot-grid manuscript notebook with fountain pen and tied academic journals"
                    width={680}
                    height={520}
                    className="max-h-64 w-auto object-contain"
                  />
                  <div className="w-full pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                    FIG. 2.1 — DOT-GRID MANUSCRIPT &amp; PDF ARCHIVE
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-3 bg-[#FAF8F4]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#166534]">
                    02.1 — TWO-PANE NOTES &amp; PDF SUMMARIES
                  </div>
                  <h3 className="font-serif font-normal text-2xl sm:text-3xl tracking-[-0.02em] text-[#1C1917]">
                    Keep primary sources beside your own words
                  </h3>
                  <p className="text-sm text-[#1C1917]/75 leading-[1.75]">
                    Upload lecture PDFs into private storage, generate structured Gemini summaries
                    with key takeaways, and write tagged Markdown notes linked directly to each document.
                  </p>
                </div>
              </article>

              {/* Right Manuscript Sheet (Staggered Lower Offset: lg:mt-16) */}
              <article className="lg:col-span-6 lg:mt-16 bg-[#F7EEDB] text-[#1C1917] rounded-none border border-[#1C1917]/15">
                <div className="p-6 sm:p-10 border-b border-[#E5DEC9] flex flex-col items-center">
                  <Image
                    src="/illustrations/ai-search-discovery.jpg"
                    alt="Magnifying glass, glowing lantern, and constellation nodes emerging from an open book"
                    width={680}
                    height={520}
                    className="max-h-64 w-auto object-contain"
                  />
                  <div className="w-full pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                    FIG. 2.2 — SEMANTIC KNOWLEDGE CONSTELLATION
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-3 bg-[#FAF8F4]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#D97706]">
                    02.2 — INTELLIGENT SEARCH &amp; RECOMMENDATIONS
                  </div>
                  <h3 className="font-serif font-normal text-2xl sm:text-3xl tracking-[-0.02em] text-[#1C1917]">
                    Query every course at once in natural language
                  </h3>
                  <p className="text-sm text-[#1C1917]/75 leading-[1.75]">
                    Ask a question without remembering filenames. ChiroMemo searches your notes,
                    summaries, and goals simultaneously—synthesizing answers and recommending what to review next.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SCREEN 4: CHAPTER 03 / COLOPHON — LIBRARY INVITATION & FOOTER
           ===================================================================== */}
        <section className="relative min-h-screen flex flex-col justify-between bg-[#FAF8F4]">
          {/* Chapter 03 Masthead */}
          <div className="w-full border-b border-[#E5DEC9]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10 font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C1917]/70">
              <span>CHAPTER 03 // THE READING ROOM</span>
              <span className="hidden sm:inline">STUDENT REGISTRATION</span>
            </div>
          </div>

          {/* 7 : 5 Exposed Hairline Split */}
          <div className="mx-auto flex-1 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-[#E5DEC9]">
            {/* Left 7 Cols: Closing Editorial Invitation */}
            <div className="relative lg:col-span-7 flex flex-col justify-between px-6 py-12 lg:px-10 lg:py-16">
              <Crosshair className="hidden lg:block -right-[4.5px] top-10" />

              <span className="font-serif italic font-light text-7xl text-[#1C1917]/20 leading-none">
                03
              </span>

              <div className="space-y-6 my-auto py-8 max-w-xl">
                <h2 className="font-serif font-normal text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.06] text-[#1C1917]">
                  Step into a <em className="italic text-[#166534]">quieter</em> semester.
                </h2>
                <p className="text-base text-[#1C1917]/75 leading-[1.75]">
                  Your personal study room is ready. Create an account in under a minute, establish
                  your first course goal, and keep every lecture note where you can find it.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-sm bg-[#166534] px-7 text-sm font-medium text-[#FAF8F4] shadow-none hover:bg-[#14532d] gap-2.5"
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
                    className="h-12 rounded-sm border-[#1C1917]/25 bg-transparent px-6 text-sm font-medium text-[#1C1917] shadow-none hover:bg-[#F7EEDB] hover:border-[#1C1917]"
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
            <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 border-[#E5DEC9] bg-[#F7EEDB] p-6 lg:p-10">
              <div className="my-auto flex items-center justify-center">
                <Image
                  src="/illustrations/auth-library-window.jpg"
                  alt="Arched university library window overlooking autumn trees with an open journal and green study lamp"
                  width={720}
                  height={900}
                  className="max-h-[440px] w-auto object-contain"
                />
              </div>
              <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#1C1917]/60">
                <span>FIG. 3.1 — THE QUIET READING ROOM</span>
                <span>ARCHIVE PLATE IV</span>
              </div>
            </div>
          </div>

          {/* Editorial Colophon Footer */}
          <footer className="w-full border-t border-[#E5DEC9] bg-[#FAF8F4] py-6">
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-10">
              <div className="flex items-center gap-4">
                <ChiroMemoLogo size="sm" />
                <span className="hidden sm:inline text-[#E5DEC9]">|</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1C1917]/60">
                  PLKMS · PERSONAL LEARNING &amp; KNOWLEDGE SYSTEM
                </span>
              </div>

              <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
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
