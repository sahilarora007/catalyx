"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { FlowState, FlowStep, AnalysisResult, InterviewAnswer, GenerationResult, InterviewQuestion } from "./types";

const initialState: FlowState = {
  step: "input",
  initialPrompt: "",
  analysisResult: null,
  interviewAnswers: [],
  currentQuestionIndex: 0,
  generationResult: null,
  isLoading: false,
  error: null,
};

type FlowAction =
  | { type: "SET_STEP"; step: FlowStep }
  | { type: "SET_PROMPT"; prompt: string }
  | { type: "SET_ANALYSIS"; result: AnalysisResult }
  | { type: "ADD_ANSWER"; answer: InterviewAnswer }
  | { type: "ADD_QUESTIONS"; questions: InterviewQuestion[] }
  | { type: "SET_QUESTION_INDEX"; index: number }
  | { type: "SET_GENERATION"; result: GenerationResult }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, error: null };
    case "SET_PROMPT":
      return { ...state, initialPrompt: action.prompt };
    case "SET_ANALYSIS":
      return { ...state, analysisResult: action.result };
    case "ADD_ANSWER":
      return {
        ...state,
        interviewAnswers: [...state.interviewAnswers, action.answer],
      };
    case "ADD_QUESTIONS":
      return {
        ...state,
        analysisResult: state.analysisResult
          ? {
              ...state.analysisResult,
              interviewQuestions: [
                ...state.analysisResult.interviewQuestions,
                ...action.questions,
              ],
            }
          : null,
      };
    case "SET_QUESTION_INDEX":
      return { ...state, currentQuestionIndex: action.index };
    case "SET_GENERATION":
      return { ...state, generationResult: action.result };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface FlowContextValue {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
}
