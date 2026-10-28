"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  FileText,
  BookOpen,
  Sparkles,
  Target,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SearchEntityType } from "@/lib/validations/search";

interface SearchFiltersProps {
  activeType: SearchEntityType;
}

const FILTER_OPTIONS: {
  id: SearchEntityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "ALL", label: "All Items", icon: Layers },
  { id: "NOTE", label: "Notes", icon: FileText },
  { id: "RESOURCE", label: "Resources", icon: BookOpen },
  { id: "SUMMARY", label: "AI Summaries", icon: Sparkles },
  { id: "GOAL", label: "Goals", icon: Target },
  { id: "ROADMAP", label: "Roadmaps", icon: Map },
];

export function SearchFilters({ activeType }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSelectType = (selectedType: SearchEntityType) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (selectedType === "ALL") {
        params.delete("type");
      } else {
        params.set("type", selectedType);
      }
      router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-2">
      {FILTER_OPTIONS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeType === filter.id;

        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectType(filter.id)}
            className="h-8 text-xs font-medium rounded-full px-3 transition-colors"
          >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}

