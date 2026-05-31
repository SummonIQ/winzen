"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";

type Phase = "initial" | "strike" | "final";

type HeroDownloadCtaProps = {
  href: string;
  startLabel?: string;
  endLabel?: string;
  badgeText?: string;
  trailing?: ReactNode;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
  labelWrapperClassName?: string;
  startLabelClassName?: string;
  strikeLabelClassName?: string;
  strikeLineClassName?: string;
  badgeClassName?: string;
  showHoverOverlay?: boolean;
  hoverOverlayClassName?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroDownloadCta({
  href,
  startLabel = "Request Access",
  endLabel = "Download Now",
  badgeText = "macOS",
  trailing,
  ariaLabel = "Download Winzen",
  className = "group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white rounded-xl font-semibold overflow-hidden transition-[transform,box-shadow] duration-300 shadow-[0_18px_50px_-26px_rgba(37,99,235,0.55),0_10px_24px_-14px_rgba(0,0,0,0.35)] hover:shadow-[0_26px_70px_-30px_rgba(79,70,229,0.55),0_18px_40px_-18px_rgba(0,0,0,0.45)] hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-gray-950 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/18 before:via-white/6 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-[-60%] after:bg-gradient-to-br after:from-white/0 after:via-white/30 after:to-white/0 after:opacity-0 after:blur-sm after:rotate-12 after:-translate-x-[60%] after:transition-[transform,opacity] after:duration-700 after:ease-out group-hover:after:opacity-80 group-hover:after:translate-x-[60%]",
  iconClassName = "w-5 h-5",
  labelWrapperClassName = "relative z-10 inline-flex items-center",
  startLabelClassName = "text-white",
  strikeLabelClassName = "text-white/65 scale-[1.01]",
  strikeLineClassName = "bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]",
  badgeClassName = "relative z-10 text-xs px-2.5 py-0.5 bg-white/20 rounded-full backdrop-blur-sm",
  showHoverOverlay = true,
  hoverOverlayClassName = "absolute -inset-2 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl",
}: HeroDownloadCtaProps) {
  const [phase, setPhase] = useState<Phase>("initial");
  const { track } = useAnalytics();

  const reduced = useMemo(() => {
    if (typeof window === "undefined") return true;
    return prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (reduced) {
      setPhase("final");
      return;
    }

    const t1 = window.setTimeout(() => setPhase("strike"), 450);
    const t2 = window.setTimeout(() => setPhase("final"), 1050);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  const showOld = phase !== "final";
  const showNew = phase === "final";

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() =>
        track("download_cta_clicked", {
          href,
          label: endLabel,
          source: "winzen-marketing",
        })
      }
    >
      {showHoverOverlay && <div className={hoverOverlayClassName} />}
      <Download
        className={`${iconClassName} relative z-10 group-hover:scale-110 transition-transform`}
      />

      <span className={labelWrapperClassName}>
        {/* Old label */}
        <span
          className={`relative inline-flex items-center transition-all duration-500 ${
            showOld ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          <span
            className={`relative ${
              phase === "strike" ? strikeLabelClassName : startLabelClassName
            }`}
          >
            {startLabel}
            <span
              className={`pointer-events-none absolute left-[-2px] right-[-2px] top-1/2 -translate-y-1/2 h-[3px] rounded-full origin-left transition-transform duration-500 ${strikeLineClassName} ${
                phase === "strike" ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </span>
        </span>

        {/* New label */}
        <span
          className={`absolute transition-all duration-500 ${
            showNew ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          {endLabel}
        </span>
      </span>

      {trailing ? (
        trailing
      ) : badgeText ? (
        <span className={badgeClassName}>{badgeText}</span>
      ) : null}
    </a>
  );
}
