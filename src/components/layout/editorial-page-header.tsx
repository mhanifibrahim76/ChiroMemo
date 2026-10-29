import Image from "next/image";
import { cn } from "@/lib/utils";

interface EditorialPageHeaderProps {
  chapter: string;
  title: string;
  italicWord?: string;
  description: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
  figureCaption?: string;
  aspectRatio?: "square" | "landscape" | "portrait";
  action?: React.ReactNode;
  className?: string;
}

export function EditorialPageHeader({
  chapter,
  title,
  italicWord,
  description,
  illustrationSrc,
  illustrationAlt = "Editorial illustration",
  figureCaption,
  aspectRatio = "square",
  action,
  className,
}: EditorialPageHeaderProps) {
  return (
    <div
      className={cn(
        "relative rounded-none border border-[#E5DEC9] bg-[#F7EEDB] p-5 sm:p-7",
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Academic Typographic Heading */}
        <div className="max-w-2xl space-y-2.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#166534]">
            {chapter}
          </div>

          <h1 className="font-serif font-normal text-3xl sm:text-4xl tracking-[-0.03em] leading-tight text-[#1C1917]">
            {title}
            {italicWord && (
              <>
                {" "}
                <em className="italic text-[#166534]">{italicWord}</em>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#1C1917]/75 leading-relaxed max-w-xl">
            {description}
          </p>

          {action && <div className="pt-2">{action}</div>}
        </div>

        {/* Right: Editorial Framed Illustration Plate with Centered Caption */}
        {illustrationSrc && (
          <div className="shrink-0 flex flex-col items-center gap-2 self-center lg:self-center">
            <div
              className={cn(
                "relative overflow-hidden rounded-none border border-[#1C1917]/20 bg-[#F7EEDB] p-1.5 shadow-2xs",
                aspectRatio === "square" && "h-[100px] w-[100px] sm:h-[116px] sm:w-[116px]",
                aspectRatio === "landscape" && "h-[84px] w-[148px] sm:h-[100px] sm:w-[180px]",
                aspectRatio === "portrait" && "h-[116px] w-[84px] sm:h-[132px] sm:w-[100px]"
              )}
            >
              <div className="relative h-full w-full">
                <Image
                  src={illustrationSrc}
                  alt={illustrationAlt}
                  fill
                  sizes="(min-width: 640px) 180px, 116px"
                  className="object-contain"
                />
              </div>
            </div>
            {figureCaption && (
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1C1917]/55 text-center">
                {figureCaption}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
