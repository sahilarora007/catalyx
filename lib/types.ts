// ── Catalyx AI — TypeScript Types ──

export interface AnalysisResult {
  initialScore: number;
  missingRequirements: string[];
  interviewQuestions: InterviewQuestion[];
  summary: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "text";
  options?: string[];
  category: string;
  dependsOn?: {
    questionId: string;
    answer: string;
  };
}

export interface InterviewAnswer {
  questionId: string;
  answer: string | string[];
}

export interface GenerationResult {
  initialScore: number;
  optimizedScore: number;
  optimizedPrompt: string;
  missingRequirements: string[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    authentication: string;
    hosting: string;
    deployment: string;
  };
  features: string[];
  uiSuggestions: string[];
  architecture: string[];
  performance: string[];
  security: string[];
  folderStructure: string[];
  suggestedApis: string[];
  futureImprovements: string[];
  developerNotes: string[];
  masterPrompt: string;
}

export interface PromptHistoryEntry {
  id: string;
  prompt: string;
  score: number;
  optimizedScore: number;
  timestamp: number;
}

export type FlowStep = "input" | "analyzing" | "interview" | "generating" | "results";

export interface FlowState {
  step: FlowStep;
  initialPrompt: string;
  analysisResult: AnalysisResult | null;
  interviewAnswers: InterviewAnswer[];
  currentQuestionIndex: number;
  generationResult: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
}
