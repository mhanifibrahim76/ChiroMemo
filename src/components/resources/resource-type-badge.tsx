import { FileText, Video, Globe, Book, GraduationCap, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ResourceType } from "@/lib/validations/resources";

interface ResourceTypeConfig {
  label: string;
  icon: LucideIcon;
  variant: "default" | "secondary" | "outline";
  className?: string;
}

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, ResourceTypeConfig> = {
  PDF: {
    label: "PDF",
    icon: FileText,
    variant: "secondary",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
  },
  VIDEO: {
    label: "Video",
    icon: Video,
    variant: "secondary",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  },
  WEBSITE: {
    label: "Website",
    icon: Globe,
    variant: "secondary",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  },
  BOOK: {
    label: "Book",
    icon: Book,
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  },
  COURSE: {
    label: "Course",
    icon: GraduationCap,
    variant: "secondary",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
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
    variant: "outline",
    className: "",
  };

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 font-medium px-2 py-0.5 text-xs ${config.className} ${className ?? ""}`}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{config.label}</span>
    </Badge>
  );
}

