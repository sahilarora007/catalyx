"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RotateCcw,
  AlertCircle,
  Download,
  FileDown,
  History,
  X,
  Code2,
  Database,
  Globe,
  KeyRound,
  Server,
  Rocket,
  Lightbulb,
  FolderTree,
  Plug,
  TrendingUp,
  StickyNote,
  Gauge,
  ShieldCheck,
  Palette,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useFlow } from "@/lib/store";
import { PromptScore } from "@/components/prompt-score";
import { InterviewCard } from "@/components/interview-card";
import { LoadingStages } from "@/components/loading-stages";
import { SectionCard } from "@/components/section-card";
import { CopyButton } from "@/components/copy-button";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { downloadAsFile, generateId } from "@/lib/utils";
import type {
  InterviewAnswer,
  InterviewQuestion,
  PromptHistoryEntry,
} from "@/lib/types";

const EXAMPLE_PROMPTS = [
  "Build an ecommerce website",
  "Make a task management app",
  "Create a Netflix clone",
  "Build a CRM system",
  "Make an AI chatbot assistant",
];

const fadeVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

export function OptimizeFlow() {
  const { state, dispatch } = useFlow();
  const [prompt, setPrompt] = useState("");
  const [apiDone, setApiDone] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useLocalStorage<PromptHistoryEntry[]>(
    "catalyx-history",
    []
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (prompt.trim().length < 3) return;

    dispatch({ type: "SET_PROMPT", prompt: prompt.trim() });
    dispatch({ type: "SET_STEP", step: "analyzing" });
    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      dispatch({
        type: "SET_ANALYSIS",
        result: {
          initialScore: data.initialScore,
          missingRequirements: data.missingRequirements || [],
          interviewQuestions: data.interviewQuestions || [],
          summary: data.summary || "",
        },
      });
      dispatch({ type: "SET_LOADING", loading: false });

      // Brief pause to show the score, then move to interview
      setTimeout(() => {
        dispatch({ type: "SET_STEP", step: "interview" });
      }, 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      dispatch({ type: "SET_ERROR", error: message });
      dispatch({ type: "SET_STEP", step: "input" });
      toast.error(message);
    }
  };

  const handleGenerate = async (answers: InterviewAnswer[]) => {
    dispatch({ type: "SET_STEP", step: "generating" });
    dispatch({ type: "SET_LOADING", loading: true });
    setApiDone(false);

    try {
      const questions = state.analysisResult?.interviewQuestions || [];
      const formattedAnswers = answers.map((a) => {
        const q = questions.find((q: InterviewQuestion) => q.id === a.questionId);
        return {
          question: q?.question || a.questionId,
          answer: a.answer,
        };
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialPrompt: state.initialPrompt,
          initialScore: state.analysisResult?.initialScore || 0,
          answers: formattedAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      dispatch({ type: "SET_GENERATION", result: data });
      dispatch({ type: "SET_LOADING", loading: false });
      setApiDone(true);

      // Save to history
      const entry: PromptHistoryEntry = {
        id: generateId(),
        prompt: state.initialPrompt,
        score: state.analysisResult?.initialScore || 0,
        optimizedScore: data.optimizedScore || 0,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev.slice(0, 19)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      dispatch({ type: "SET_ERROR", error: message });
      dispatch({ type: "SET_STEP", step: "input" });
      toast.error(message);
    }
  };

  const handleInterviewAnswer = useCallback(
    (answer: string | string[]) => {
      if (!state.analysisResult) return;

      const questions = state.analysisResult.interviewQuestions || [];
      const currentQ = questions[state.currentQuestionIndex];

      if (!currentQ) {
        handleGenerate(state.interviewAnswers);
        return;
      }

      const newAnswer: InterviewAnswer = {
        questionId: currentQ.id,
        answer,
      };

      dispatch({ type: "ADD_ANSWER", answer: newAnswer });

      if (state.currentQuestionIndex + 1 < questions.length) {
        dispatch({
          type: "SET_QUESTION_INDEX",
          index: state.currentQuestionIndex + 1,
        });
      } else {
        // Interview complete — start generation
        handleGenerate([...state.interviewAnswers, newAnswer]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.analysisResult, state.currentQuestionIndex, state.interviewAnswers]
  );

  const handleSkipQuestion = useCallback(() => {
    if (!state.analysisResult) return;

    const questions = state.analysisResult.interviewQuestions || [];

    if (state.currentQuestionIndex + 1 < questions.length) {
      dispatch({
        type: "SET_QUESTION_INDEX",
        index: state.currentQuestionIndex + 1,
      });
    } else {
      handleGenerate(state.interviewAnswers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.analysisResult, state.currentQuestionIndex, state.interviewAnswers]);

  const handleLoadingComplete = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "results" });
  }, [dispatch]);

  const handleReset = () => {
    dispatch({ type: "RESET" });
    setPrompt("");
    setApiDone(false);
    textareaRef.current?.focus();
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && state.step === "input") {
        e.preventDefault();
        if (prompt.trim().length >= 3) handleAnalyze();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, state.step]);

  // Auto-scroll to results
  useEffect(() => {
    if (state.step === "results" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.step]);

  const handleExportMarkdown = () => {
    if (!state.generationResult) return;
    const content = state.generationResult.masterPrompt;
    downloadAsFile(content, "catalyx-master-prompt.md", "text/markdown");
    toast.success("Downloaded as Markdown");
  };

  const handleExportTxt = () => {
    if (!state.generationResult) return;
    const content = state.generationResult.masterPrompt;
    downloadAsFile(content, "catalyx-master-prompt.txt", "text/plain");
    toast.success("Downloaded as TXT");
  };

  const result = state.generationResult;

  return (
    <div className="space-y-8">
      {/* History toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          Recent
        </button>
      </div>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-paper-2)] p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--color-ink-2)]">
                  Recent Prompts
                </span>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {history.slice(0, 5).map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setPrompt(entry.prompt);
                      setShowHistory(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--color-paper-3)] hover:bg-[var(--color-paper-4)] text-sm text-[var(--color-ink-2)] transition-colors truncate"
                  >
                    {entry.prompt}
                    <span className="ml-2 text-xs text-[var(--color-ink-3)] tabular-nums">
                      {entry.score} → {entry.optimizedScore}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Input ── */}
        {state.step === "input" && (
          <motion.div key="input" {...fadeVariants}>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-2">
                What do you want to build?
              </h1>
              <p className="text-sm text-[var(--color-ink-2)]">
                Paste your idea — even a single sentence works.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Build an ecommerce website with user auth, payments, and an admin dashboard..."
                  rows={5}
                  className="w-full px-5 py-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-paper-2)] text-[var(--color-ink)] text-sm placeholder:text-[var(--color-ink-3)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-[var(--dur-fast)]"
                  autoFocus
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-[var(--color-ink-3)]">
                  ⌘ Enter
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={prompt.trim().length < 3}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-[var(--dur-fast)]"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Prompt
              </button>

              {/* Example prompts */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="px-3 py-1.5 text-xs rounded-full border border-[var(--color-border)] text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] hover:border-[var(--color-border-hover)] transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Analyzing ── */}
        {state.step === "analyzing" && (
          <motion.div
            key="analyzing"
            {...fadeVariants}
            className="text-center py-12"
          >
            {state.isLoading ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 text-[var(--color-accent)]" />
                  </motion.div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    Analyzing your idea...
                  </p>
                  <p className="text-xs text-[var(--color-ink-3)] mt-1">
                    Scoring prompt and identifying gaps
                  </p>
                </div>
              </div>
            ) : state.analysisResult ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <PromptScore
                    score={state.analysisResult.initialScore}
                    label="Current Score"
                    size="lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-ink-2)] mb-3">
                    {state.analysisResult.summary}
                  </p>
                  {state.analysisResult.missingRequirements.length > 0 && (
                    <div className="inline-flex flex-wrap gap-1.5 justify-center">
                      {state.analysisResult.missingRequirements
                        .slice(0, 5)
                        .map((req) => (
                          <span
                            key={req}
                            className="px-2.5 py-1 text-xs rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20"
                          >
                            {req}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--color-ink-3)]">
                  Starting guided interview...
                </p>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ── Step 3: Interview ── */}
        {state.step === "interview" &&
          state.analysisResult &&
          state.analysisResult.interviewQuestions &&
          state.analysisResult.interviewQuestions[state.currentQuestionIndex] && (
            <motion.div key="interview" {...fadeVariants} className="py-4">
              <InterviewCard
                question={
                  state.analysisResult.interviewQuestions[
                    state.currentQuestionIndex
                  ]
                }
                currentIndex={state.currentQuestionIndex}
                totalQuestions={
                  state.analysisResult.interviewQuestions.length
                }
                onAnswer={handleInterviewAnswer}
                onSkip={handleSkipQuestion}
              />
            </motion.div>
          )}

        {/* ── Step 4: Generating ── */}
        {state.step === "generating" && (
          <motion.div
            key="generating"
            {...fadeVariants}
            className="py-16 text-center"
          >
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-1">
                Generating your Master Prompt
              </h2>
              <p className="text-sm text-[var(--color-ink-3)]">
                This usually takes 10-20 seconds.
              </p>
            </div>
            <LoadingStages
              onComplete={handleLoadingComplete}
              isApiDone={apiDone}
            />
          </motion.div>
        )}

        {/* ── Step 5: Results ── */}
        {state.step === "results" && result && (
          <motion.div
            key="results"
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--color-ink)]">
                Results
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  MD
                </button>
                <button
                  onClick={handleExportTxt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)] transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  TXT
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New
                </button>
              </div>
            </div>

            {/* Score comparison */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-paper-2)] p-6"
            >
              <h2 className="text-xs uppercase tracking-wider text-[var(--color-ink-3)] font-medium mb-5">
                Prompt Quality
              </h2>
              <div className="flex items-center justify-center gap-8 sm:gap-16">
                <div className="text-center">
                  <PromptScore
                    score={result.initialScore}
                    label="Before"
                    size="md"
                    animate={false}
                  />
                </div>
                <div className="text-2xl text-[var(--color-ink-3)]">→</div>
                <div className="text-center">
                  <PromptScore
                    score={result.optimizedScore}
                    label="After"
                    size="md"
                  />
                </div>
              </div>
            </motion.div>

            {/* Optimized prompt */}
            {result.optimizedPrompt && (
              <SectionCard
                title="Optimized Prompt"
                icon={<Sparkles className="w-4 h-4" />}
                defaultOpen
              >
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-3">
                  {result.optimizedPrompt}
                </p>
                <CopyButton text={result.optimizedPrompt} />
              </SectionCard>
            )}

            {/* Missing requirements */}
            {result.missingRequirements?.length > 0 && (
              <SectionCard
                title="Missing Requirements Found"
                icon={<AlertCircle className="w-4 h-4" />}
                defaultOpen
              >
                <ul className="space-y-1.5">
                  {result.missingRequirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-warning)] mt-0.5">
                        •
                      </span>
                      {req}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Tech stack */}
            {result.techStack && (
              <SectionCard
                title="Suggested Tech Stack"
                icon={<Code2 className="w-4 h-4" />}
                defaultOpen
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Frontend", value: result.techStack.frontend, icon: Globe },
                    { label: "Backend", value: result.techStack.backend, icon: Server },
                    { label: "Database", value: result.techStack.database, icon: Database },
                    { label: "Auth", value: result.techStack.authentication, icon: KeyRound },
                    { label: "Hosting", value: result.techStack.hosting, icon: Layers },
                    { label: "Deploy", value: result.techStack.deployment, icon: Rocket },
                  ].map(
                    (item) =>
                      item.value && (
                        <div
                          key={item.label}
                          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-paper-3)] p-3"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <item.icon className="w-3 h-3 text-[var(--color-ink-3)]" />
                            <span className="text-[10px] uppercase tracking-wider text-[var(--color-ink-3)] font-medium">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[var(--color-ink)]">
                            {item.value}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </SectionCard>
            )}

            {/* Features */}
            {result.features?.length > 0 && (
              <SectionCard
                title="Recommended Features"
                icon={<Lightbulb className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* UI Suggestions */}
            {result.uiSuggestions?.length > 0 && (
              <SectionCard
                title="UI/UX Suggestions"
                icon={<Palette className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.uiSuggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Architecture */}
            {result.architecture?.length > 0 && (
              <SectionCard
                title="Architecture Suggestions"
                icon={<Layers className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.architecture.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Performance */}
            {result.performance?.length > 0 && (
              <SectionCard
                title="Performance Suggestions"
                icon={<Gauge className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.performance.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Security */}
            {result.security?.length > 0 && (
              <SectionCard
                title="Security Recommendations"
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.security.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Folder structure */}
            {result.folderStructure?.length > 0 && (
              <SectionCard
                title="Folder Structure"
                icon={<FolderTree className="w-4 h-4" />}
              >
                <div className="rounded-[var(--radius-md)] bg-[var(--color-paper-3)] border border-[var(--color-border)] p-4 font-mono text-xs text-[var(--color-ink-2)] space-y-0.5 overflow-x-auto">
                  {result.folderStructure.map((path, i) => (
                    <div key={i}>{path}</div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Suggested APIs */}
            {result.suggestedApis?.length > 0 && (
              <SectionCard
                title="Suggested APIs & Services"
                icon={<Plug className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.suggestedApis.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Future improvements */}
            {result.futureImprovements?.length > 0 && (
              <SectionCard
                title="Future Improvements"
                icon={<TrendingUp className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.futureImprovements.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Developer notes */}
            {result.developerNotes?.length > 0 && (
              <SectionCard
                title="Developer Notes"
                icon={<StickyNote className="w-4 h-4" />}
              >
                <ul className="space-y-1.5">
                  {result.developerNotes.map((n, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]"
                    >
                      <span className="text-[var(--color-accent)] mt-0.5">
                        •
                      </span>
                      {n}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* ── MASTER PROMPT ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[var(--radius-xl)] border-2 border-[var(--color-accent)]/30 bg-[var(--color-paper-2)] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[var(--color-ink)]">
                      Master Prompt
                    </h2>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      Ready to paste into any AI coding assistant
                    </p>
                  </div>
                </div>
                <CopyButton
                  text={result.masterPrompt}
                  variant="large"
                  label="Copy Prompt"
                />
              </div>
              <div className="p-6 max-h-[500px] overflow-y-auto">
                <pre className="text-sm text-[var(--color-ink-2)] whitespace-pre-wrap leading-relaxed font-[var(--font-geist-sans)]">
                  {result.masterPrompt}
                </pre>
              </div>
              <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-center gap-3">
                <CopyButton
                  text={result.masterPrompt}
                  variant="large"
                  label="Copy Master Prompt"
                />
              </div>
            </motion.div>

            {/* Start over */}
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Error state ── */}
        {state.error && state.step !== "results" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[var(--radius-lg)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-5 text-center"
          >
            <AlertCircle className="w-5 h-5 text-[var(--color-error)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-error)] mb-3">
              {state.error}
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
