import { FileText, Video, Globe, Book, GraduationCap, LucideIcon } from "lucide-react";
import type { ResourceType } from "@/lib/validations/resources";

interface ResourceTypeConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, ResourceTypeConfig> = {
  PDF: {
    label: "PDF",
    icon: FileText,
    className: "border-[#D97706]/35 bg-[#D97706]/10 text-[#D97706]",
  },
  VIDEO: {
    label: "VIDEO",
    icon: Video,
    className: "border-[#166534]/30 bg-[#166534]/10 text-[#166534]",
  },
  WEBSITE: {
    label: "WEB",
    icon: Globe,
    className: "border-[#E5DEC9] bg-[#F7EEDB] text-[#1C1917]/80",
  },
  BOOK: {
    label: "BOOK",
    icon: Book,
    className: "border-[#166534]/25 bg-[#F7EEDB] text-[#166534]",
  },
  COURSE: {
    label: "COURSE",
    icon: GraduationCap,
    className: "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/75",
  },
};

export function ResourceTypeBadge({
  type,
  className,
  showIcon = true,
}: {
  type: ResourceType;
  className?: string;
  showIcon?: boolean;
}) {
  const config = RESOURCE_TYPE_CONFIG[type] ?? {
    label: type,
    icon: FileText,
    className: "border-[#E5DEC9] bg-[#FAF8F4] text-[#1C1917]/70",
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 ${config.className} ${className ?? ""}`}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}


