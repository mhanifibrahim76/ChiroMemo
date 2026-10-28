"use client";

import Link from "next/link";
import { Sparkles, Lightbulb, ArrowRight, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">
              AI Semantic Synthesis
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-primary/20 text-primary">
            {modelUsed}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-sm">
        {/* Direct Answer */}
        <div className="space-y-1.5">
          <p className="leading-relaxed text-foreground font-normal">
            {synthesis.directAnswer}
          </p>
        </div>

        {/* Key Conceptual Insights */}
        {synthesis.keyInsights && synthesis.keyInsights.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-primary/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Key Insights from Your Knowledge Base
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {synthesis.keyInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 rounded-md bg-background/80 p-2.5 text-xs border border-primary/10 shadow-2xs"
                >
                  <span className="font-semibold text-primary">•</span>
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Follow-up Searches */}
        {synthesis.suggestedFollowUps && synthesis.suggestedFollowUps.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-primary/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5 text-primary" />
              Suggested Follow-up Inquiries
            </div>
            <div className="flex flex-wrap gap-2">
              {synthesis.suggestedFollowUps.map((followUp, idx) => (
                <Link
                  key={idx}
                  href={`/search?q=${encodeURIComponent(followUp)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <span>{followUp}</span>
                  <ArrowRight className="h-3 w-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

