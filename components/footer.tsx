import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-6 px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--color-ink-3)] text-sm">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="font-medium text-[var(--color-ink-2)]">
            Catalyx AI
          </span>
          <span className="hidden sm:inline">
            — From vague ideas to production-ready prompts.
          </span>
        </div>
        <div className="text-xs text-[var(--color-ink-3)]">
          {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
