"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PromptScoreProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function PromptScore({
  score,
  label = "Prompt Score",
  size = "md",
  animate = true,
}: PromptScoreProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);

    return () => clearInterval(interval);
  }, [score, animate]);

  const sizeMap = {
    sm: { container: "w-20 h-20", text: "text-xl", label: "text-[10px]" },
    md: { container: "w-28 h-28", text: "text-3xl", label: "text-xs" },
    lg: { container: "w-36 h-36", text: "text-4xl", label: "text-sm" },
  };

  const radius = size === "sm" ? 32 : size === "md" ? 48 : 60;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "var(--color-success)";
    if (s >= 50) return "var(--color-warning)";
    return "var(--color-error)";
  };

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`${sizeMap[size].container} relative flex items-center justify-center`}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${(radius + 6) * 2} ${(radius + 6) * 2}`}
      >
        <circle
          cx={radius + 6}
          cy={radius + 6}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
        />
        <motion.circle
          cx={radius + 6}
          cy={radius + 6}
          r={radius}
          fill="none"
          stroke={getScoreColor(displayScore)}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span
          className={`${sizeMap[size].text} font-bold tabular-nums`}
          style={{ color: getScoreColor(displayScore) }}
        >
          {Math.round(displayScore)}
        </span>
        <span className={`${sizeMap[size].label} text-[var(--color-ink-3)] mt-0.5`}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}
