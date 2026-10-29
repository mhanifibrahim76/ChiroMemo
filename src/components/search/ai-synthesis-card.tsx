"use client";

import Link from "next/link";
import { Sparkles, Lightbulb, ArrowRight, Compass } from "lucide-react";
import type { GeminiSearchSynthesis } from "@/lib/validations/search";

interface AiSynthesisCardProps {
  synthesis: GeminiSearchSynthesis;
  modelUsed?: string;
}

export function AiSynthesisCard({
  synthesis,
  modelUsed = "gemini-2.5-flash",
}: AiSynthesisCardProps) {
  return (
    <div className="border border-[#E5DEC9] bg-[#FDFCFA]">
      <div className="px-6 py-4 border-b border-[#E5DEC9] bg-[#F7EEDB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#166534]/25 bg-[#166534]/10 text-[#166534]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#166534] uppercase tracking-widest leading-none mb-1">
              SEMANTIC ANSWER {"//"} SYNTHESIS
            </p>
            <h2 className="font-serif font-normal text-xl tracking-tight text-[#1C1917] leading-none">
              AI Semantic Synthesis
            </h2>
          </div>
        </div>
        <span className="inline-flex items-center rounded-sm border border-[#166534]/30 bg-[#FDFCFA] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#166534]">
          {modelUsed}
        </span>
      </div>

      <div className="p-6 space-y-5 text-sm">
        {/* Direct Answer */}
        <div className="space-y-1.5">
          <p className="leading-relaxed text-[#1C1917]/85 font-normal">
            {synthesis.directAnswer}
          </p>
        </div>

        {/* Key Conceptual Insights */}
        {synthesis.keyInsights && synthesis.keyInsights.length > 0 && (
          <div className="space-y-2.5 pt-4 border-t border-[#E5DEC9]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#1C1917]/65 uppercase tracking-wider">
              <Lightbulb className="h-3.5 w-3.5 text-[#D97706]" />
              Key Insights from Your Knowledge Base
            </div>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {synthesis.keyInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-sm bg-[#FAF8F4] p-3 text-xs border border-[#E5DEC9]"
                >
                  <span className="font-mono font-semibold text-[#166534]">
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  <span className="text-[#1C1917]/75 leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Follow-up Searches */}
        {synthesis.suggestedFollowUps && synthesis.suggestedFollowUps.length > 0 && (
          <div className="space-y-2.5 pt-4 border-t border-[#E5DEC9]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#1C1917]/65 uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5 text-[#166534]" />
              Suggested Follow-up Inquiries
            </div>
            <div className="flex flex-wrap gap-2">
              {synthesis.suggestedFollowUps.map((followUp, idx) => (
                <Link
                  key={idx}
                  href={`/search?q=${encodeURIComponent(followUp)}`}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5DEC9] bg-[#FAF8F4] px-3 py-1.5 text-xs text-[#1C1917]/80 hover:bg-[#F7EEDB] hover:text-[#166534] hover:border-[#166534]/30 transition-colors"
                >
                  <span>{followUp}</span>
                  <ArrowRight className="h-3 w-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


