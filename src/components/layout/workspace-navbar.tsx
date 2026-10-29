"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Map,
  BookOpen,
  FileText,
  Sparkles,
  Search,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/summaries", label: "Summaries", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/recommendations", label: "Advisory", icon: Lightbulb },
];

export function WorkspaceNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
      {navLinks.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs transition-all shrink-0",
              isActive
                ? "bg-[#F7EEDB] text-[#166534] font-semibold border border-[#E5DEC9] shadow-2xs"
                : "text-[#1C1917]/70 font-medium hover:text-[#1C1917] hover:bg-[#F7EEDB]/60"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                isActive ? "text-[#166534]" : "text-[#1C1917]/50"
              )}
            />
            <span>{item.label}</span>

            {/* Subtle active ink marker dot */}
            {isActive && (
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-[#166534]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

