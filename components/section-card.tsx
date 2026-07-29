"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SectionCard({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-paper-2)] overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--color-paper-3)] transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-[var(--color-accent)]">{icon}</span>
          )}
          <h3 className="font-semibold text-[var(--color-ink)]">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--color-ink-3)] transition-transform duration-[var(--dur-normal)]",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-1">{children}</div>
      </motion.div>
    </motion.div>
  );
}
