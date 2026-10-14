"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { InterviewQuestion } from "@/lib/types";
import { useState } from "react";

interface InterviewCardProps {
  question: InterviewQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string | string[]) => void;
  onSkip: () => void;
}

export function InterviewCard({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onSkip,
}: InterviewCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");

  if (!question) {
    return null;
  }

  const handleSingleSelect = (option: string) => {
    setSelected([option]);
    // Auto-advance after a brief delay for single-select
    setTimeout(() => onAnswer(option), 300);
  };

  const handleMultiSelect = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = () => {
    if (question.type === "text" && textValue.trim()) {
      onAnswer(textValue.trim());
    } else if (question.type === "multiple" && selected.length > 0) {
      onAnswer(selected);
    }
  };

  return (
    <motion.div
      key={question.id || `q-${currentIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--color-ink-3)] uppercase tracking-wider">
            {question.category || "General"}
          </span>
          <span className="text-xs text-[var(--color-ink-3)] tabular-nums">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="h-1 rounded-full bg-[var(--color-paper-3)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--color-accent)]"
            initial={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
            animate={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-5 leading-relaxed">
        {question.question}
      </h2>

      {/* Options */}
      {(question.type === "single" || question.type === "multiple") &&
        question.options && (
          <div className="space-y-2.5 mb-6">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() =>
                  question.type === "single"
                    ? handleSingleSelect(option)
                    : handleMultiSelect(option)
                }
                className={cn(
                  "w-full text-left px-4 py-3 rounded-[var(--radius-md)] border text-sm font-medium transition-all duration-[var(--dur-fast)]",
                  "hover:bg-[var(--color-paper-3)] hover:border-[var(--color-border-hover)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                  selected.includes(option)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-ink)]"
                    : "border-[var(--color-border)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      question.type === "multiple" && "rounded-[3px]",
                      selected.includes(option)
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                        : "border-[var(--color-ink-3)]"
                    )}
                  >
                    {selected.includes(option) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-white"
                      />
                    )}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        )}

      {/* Text input */}
      {question.type === "text" && (
        <div className="mb-6">
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Type your answer..."
            rows={3}
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-paper-3)] text-[var(--color-ink)] text-sm placeholder:text-[var(--color-ink-3)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] transition-colors duration-[var(--dur-fast)]"
        >
          Skip
        </button>

        {(question.type === "multiple" || question.type === "text") && (
          <button
            onClick={handleSubmit}
            disabled={
              (question.type === "text" && !textValue.trim()) ||
              (question.type === "multiple" && selected.length === 0)
            }
            className="px-5 py-2 text-sm font-medium rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-[var(--dur-fast)]"
          >
            Continue
          </button>
        )}
      </div>
    </motion.div>
  );
}
