"use client";

import { motion } from "framer-motion";
import {
  Search,
  Brain,
  Layers,
  Wand2,
  FileText,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";

const stages = [
  { label: "Analyzing your idea", icon: Search, duration: 1200 },
  { label: "Understanding requirements", icon: Brain, duration: 1500 },
  { label: "Designing architecture", icon: Layers, duration: 1800 },
  { label: "Optimizing prompt", icon: Wand2, duration: 1400 },
  { label: "Generating Master Prompt", icon: FileText, duration: 2000 },
];

interface LoadingStagesProps {
  onComplete?: () => void;
  isApiDone?: boolean;
}

export function LoadingStages({ onComplete, isApiDone = false }: LoadingStagesProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    if (currentStage >= stages.length) return;

    // If API is done, quickly finish remaining stages
    const duration = isApiDone
      ? Math.min(stages[currentStage].duration, 400)
      : stages[currentStage].duration;

    const timer = setTimeout(() => {
      setCompletedStages((prev) => [...prev, currentStage]);
      if (currentStage + 1 < stages.length) {
        setCurrentStage(currentStage + 1);
      } else {
        setTimeout(() => onComplete?.(), 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentStage, isApiDone, onComplete]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {stages.map((stage, index) => {
        const StageIcon = stage.icon;
        const isComplete = completedStages.includes(index);
        const isCurrent = currentStage === index && !isComplete;
        const isPending = index > currentStage;

        return (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{
              opacity: isPending ? 0.3 : 1,
              x: 0,
            }}
            transition={{
              delay: index * 0.1,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center gap-4"
          >
            <div
              className={`
                w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center transition-colors duration-[var(--dur-normal)]
                ${
                  isComplete
                    ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                    : isCurrent
                    ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                    : "bg-[var(--color-paper-3)] text-[var(--color-ink-3)]"
                }
              `}
            >
              {isComplete ? (
                <Check className="w-4 h-4" />
              ) : (
                <StageIcon className="w-4 h-4" />
              )}
            </div>

            <span
              className={`text-sm font-medium transition-colors duration-[var(--dur-normal)] ${
                isComplete
                  ? "text-[var(--color-success)]"
                  : isCurrent
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-3)]"
              }`}
            >
              {stage.label}
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-1"
                >
                  ...
                </motion.span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
