import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChiroMemoLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    px: 24,
    box: "h-6 w-6",
    text: "text-sm",
  },
  md: {
    px: 32,
    box: "h-8 w-8",
    text: "text-lg",
  },
  lg: {
    px: 40,
    box: "h-10 w-10",
    text: "text-2xl",
  },
};

export function ChiroMemoLogo({
  size = "md",
  showText = true,
  className,
}: ChiroMemoLogoProps) {
  const currentSize = sizeClasses[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/logo-mark.svg"
        alt="ChiroMemo Logo"
        width={currentSize.px}
        height={currentSize.px}
        className={cn("shrink-0", currentSize.box)}
      />

      {showText && (
        <span className={cn("tracking-tight leading-none", currentSize.text)}>
          <span className="font-extrabold text-foreground">Chiro</span>
          <span className="font-semibold text-primary">Memo</span>
        </span>
      )}
    </span>
  );
}
