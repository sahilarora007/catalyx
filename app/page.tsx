"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Layers,
  Shield,
  FileText,
  Check,
  ChevronRight,
  Brain,
  MessageSquare,
  Wand2,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const platforms = [
  "Cursor",
  "Bolt",
  "Lovable",
  "Windsurf",
  "Claude Code",
  "Gemini CLI",
  "ChatGPT",
];

const features = [
  {
    icon: Target,
    title: "Smart Analysis",
    description:
      "Instantly scores your prompt and identifies gaps in requirements, architecture, and design.",
  },
  {
    icon: MessageSquare,
    title: "Guided Interview",
    description:
      "Adaptive questions that surface exactly what your prompt is missing — no generic checklists.",
  },
  {
    icon: Wand2,
    title: "Master Prompt",
    description:
      "Generates a comprehensive prompt with tech stack, folder structure, and acceptance criteria.",
  },
  {
    icon: Layers,
    title: "Full Architecture",
    description:
      "Database schemas, API endpoints, auth flows, and deployment strategy — all included.",
  },
  {
    icon: Shield,
    title: "Production Standards",
    description:
      "Error handling, accessibility, security, performance — baked into every generated prompt.",
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    description:
      "Copy to clipboard, download as Markdown or TXT. Works with any AI coding assistant.",
  },
];

const exampleImprovements = [
  "Framework and tech stack specified",
  "Missing requirements identified",
  "Architecture decisions included",
  "Production-ready Master Prompt",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-16">
          {/* Subtle background gradient */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(25% 0.04 25 / 0.3), transparent)",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-6 w-full">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="grid md:grid-cols-2 gap-12 md:gap-16 items-center"
            >
              {/* Left — Copy */}
              <div>
                <motion.h1
                  variants={fadeUp}
                  className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-ink)] mb-5"
                >
                  Stop fighting AI.
                  <br />
                  <span className="text-[var(--color-ink-2)]">
                    Start giving it instructions it actually understands.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-base text-[var(--color-ink-2)] leading-relaxed mb-8 max-w-md"
                >
                  Catalyx AI transforms vague ideas into structured,
                  production-ready prompts for Cursor, Bolt, Lovable, Claude
                  Code, Gemini CLI, ChatGPT, and other AI coding assistants.
                </motion.p>

                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <Link
                    href="/optimize"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] transition-colors duration-[var(--dur-fast)]"
                  >
                    Optimize My Prompt
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#example"
                    className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-full border border-[var(--color-border)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)] transition-colors duration-[var(--dur-fast)]"
                  >
                    See Example
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </motion.div>
              </div>

              {/* Right — Interactive Example Preview */}
              <motion.div variants={fadeUp}>
                <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-paper-2)] p-6 space-y-5">
                  {/* Input */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-3)] font-medium mb-2">
                      Input
                    </div>
                    <div className="px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-paper-3)] border border-[var(--color-border)] text-sm text-[var(--color-ink-2)]">
                      &ldquo;Build me a website.&rdquo;
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                  </div>

                  {/* Output */}
                  <div className="space-y-2.5">
                    {exampleImprovements.map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.8 + i * 0.15,
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-[var(--color-success)]" />
                        </div>
                        <span className="text-sm text-[var(--color-ink-2)]">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Score bar */}
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--color-ink-3)]">
                        Prompt Score
                      </span>
                      <span className="font-medium text-[var(--color-success)] tabular-nums">
                        23 → 97
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-paper-3)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[var(--color-success)]"
                        initial={{ width: "23%" }}
                        animate={{ width: "97%" }}
                        transition={{
                          delay: 1.5,
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 px-6" id="example">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-3">
                Three steps to a better prompt
              </h2>
              <p className="text-[var(--color-ink-2)] text-sm max-w-md mx-auto">
                From a rough idea to a structured, production-ready prompt in under two minutes.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  step: "01",
                  title: "Enter your idea",
                  desc: "Paste any rough idea — even a single sentence. Catalyx AI scores it and finds the gaps.",
                },
                {
                  icon: MessageSquare,
                  step: "02",
                  title: "Answer a few questions",
                  desc: "A guided interview surfaces exactly what's missing: users, stack, features, constraints.",
                },
                {
                  icon: Wand2,
                  step: "03",
                  title: "Get your Master Prompt",
                  desc: "A comprehensive, production-ready prompt you can paste directly into any AI assistant.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-paper-2)] p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-xs font-mono text-[var(--color-ink-3)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--color-ink)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 px-6 border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-3">
                Everything your prompt needs
              </h2>
              <p className="text-[var(--color-ink-2)] text-sm max-w-md mx-auto">
                Not just a better sentence — a complete engineering brief for your AI assistant.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-paper-2)] p-5 hover:border-[var(--color-border-hover)] transition-colors duration-[var(--dur-normal)]"
                >
                  <feature.icon className="w-5 h-5 text-[var(--color-accent)] mb-3" />
                  <h3 className="font-semibold text-sm text-[var(--color-ink)] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platforms ── */}
        <section className="py-16 px-6 border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-wider text-[var(--color-ink-3)] font-medium mb-6"
            >
              Works with every AI coding assistant
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-4 py-2 text-sm font-medium rounded-full border border-[var(--color-border)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)]"
                >
                  {platform}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 px-6 border-t border-[var(--color-border)]">
          <div className="max-w-xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-4">
                Ready to build something real?
              </h2>
              <p className="text-[var(--color-ink-2)] text-sm mb-8">
                Turn your next idea into a prompt that gets results on the first try.
              </p>
              <Link
                href="/optimize"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] transition-colors duration-[var(--dur-fast)]"
              >
                Optimize My Prompt
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
