"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Lightweight, zero-dependency client navigation progress bar.
 * Directly animates the top progress indicator on route transitions without
 * triggering cascading React component re-renders.
 */
export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress whenever the route changes
  useEffect(() => {
    if (!barRef.current) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (progressRef.current === 0) return;

    progressRef.current = 100;
    barRef.current.style.width = "100%";
    barRef.current.style.transition = "width 150ms ease-out, opacity 250ms ease-out 100ms";
    barRef.current.style.opacity = "0";

    const timeout = setTimeout(() => {
      if (!barRef.current) return;
      progressRef.current = 0;
      barRef.current.style.width = "0%";
    }, 350);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Intercept navigation link clicks globally
  useEffect(() => {
    const startProgress = () => {
      if (!barRef.current) return;
      if (intervalRef.current) clearInterval(intervalRef.current);

      progressRef.current = 20;
      barRef.current.style.opacity = "1";
      barRef.current.style.width = "20%";
      barRef.current.style.transition = "width 150ms ease-out, opacity 150ms ease-out";

      intervalRef.current = setInterval(() => {
        if (!barRef.current) return;
        if (progressRef.current >= 85) return;
        const step = Math.max(1.5, (85 - progressRef.current) * 0.15);
        progressRef.current = Math.min(85, progressRef.current + step);
        barRef.current.style.width = `${progressRef.current}%`;
      }, 120);
    };

    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      try {
        const currentUrl = new URL(window.location.href);
        const nextUrl = new URL(href, window.location.origin);

        if (
          nextUrl.origin === currentUrl.origin &&
          nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search
        ) {
          return;
        }

        if (nextUrl.origin === window.location.origin) {
          startProgress();
        }
      } catch {
        // Safe fallback if parsing fails
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] bg-transparent"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full bg-primary opacity-0 w-0"
      />
    </div>
  );
}

