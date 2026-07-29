"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "large";
  label?: string;
}

export function CopyButton({
  text,
  className,
  variant = "default",
  label,
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-all duration-[var(--dur-fast)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2",
        variant === "default" &&
          "px-3 py-1.5 text-sm rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)]",
        variant === "large" &&
          "px-6 py-3 text-base rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
        copied && "border-[var(--color-success)] text-[var(--color-success)]",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{label || "Copy"}</span>
        </>
      )}
    </button>
  );
}
