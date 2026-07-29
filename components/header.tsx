"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-6 px-5 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-paper-2)]/80 backdrop-blur-md shadow-[var(--shadow-md)]"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors duration-[var(--dur-fast)]"
        >
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold tracking-tight">
            Catalyx AI
          </span>
        </Link>

        <div className="w-px h-4 bg-[var(--color-border)]" />

        <Link
          href="/optimize"
          className="text-sm text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors duration-[var(--dur-fast)]"
        >
          Optimize
        </Link>

        <Link
          href="/optimize"
          className="text-sm font-medium px-4 py-1.5 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] transition-colors duration-[var(--dur-fast)]"
        >
          Get Started
        </Link>
      </motion.nav>
    </header>
  );
}
