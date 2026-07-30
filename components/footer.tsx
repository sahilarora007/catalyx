import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-6 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--color-ink-3)] text-sm text-center sm:text-left">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="font-medium text-[var(--color-ink-2)]">
            Catalyx AI
          </span>
          <span className="hidden md:inline">
            — From vague ideas to production-ready prompts.
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--color-ink-3)]">
          <span>
            Made with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/thesahilarora1/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-ink-2)] hover:text-[var(--color-accent)] font-medium transition-colors"
            >
              Sahil Arora
            </a>
          </span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
