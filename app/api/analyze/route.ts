import { groqWithRetry, GROQ_MODEL, safeParseJson } from "@/lib/groq-client";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return Response.json(
        { error: "Please provide a prompt with at least 3 characters." },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "API key not configured. Please add OPENROUTER_API_KEY to your environment." },
        { status: 500 }
      );
    }

    const completion = await groqWithRetry({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildAnalysisUserPrompt(prompt.trim()) },
      ],
      temperature: 0.7,
      max_tokens: 10000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI. Please try again." },
        { status: 502 }
      );
    }

    const result = safeParseJson<any>(content);

    // Normalize score and ensure valid array of questions
    const rawScore = Number(result.initialScore ?? result.score ?? 25);
    result.initialScore = !isNaN(rawScore) && rawScore > 0 ? rawScore : 25;

    if (!Array.isArray(result.missingRequirements)) {
      result.missingRequirements = [];
    }

    if (!Array.isArray(result.interviewQuestions) || result.interviewQuestions.length === 0) {
      result.interviewQuestions = [
        {
          id: "q1",
          question: "Which primary framework and tech stack do you prefer?",
          type: "single",
          options: ["Next.js (React)", "Vue / Nuxt", "SvelteKit", "Mobile (React Native / Flutter)"],
          category: "stack",
        },
        {
          id: "q2",
          question: "What core features are needed in the first release?",
          type: "multiple",
          options: ["User Authentication", "Dashboard & Analytics", "Payment Processing", "Realtime Notifications"],
          category: "features",
        },
        {
          id: "q3",
          question: "Which database or backend solution do you plan to use?",
          type: "single",
          options: ["Supabase (PostgreSQL)", "Prisma + PostgreSQL", "MongoDB", "Firebase"],
          category: "database",
        },
        {
          id: "q4",
          question: "What visual style or UI design do you envision?",
          type: "single",
          options: ["Minimal Dark Mode", "Modern Clean SaaS", "Vibrant & Playful", "Enterprise Dense"],
          category: "design",
        },
      ];
    } else {
      // Ensure every question has required fields (id, category, question, options, type)
      result.interviewQuestions = result.interviewQuestions.map((q: any, i: number) => ({
        id: q?.id || `q${i + 1}`,
        question: q?.question || `Question ${i + 1}`,
        type: q?.type === "multiple" || q?.type === "text" ? q.type : "single",
        options: Array.isArray(q?.options) && q.options.length > 0 ? q.options : ["Option A", "Option B", "Option C"],
        category: q?.category || "general",
      }));
    }

    return Response.json(result);
  } catch (error: unknown) {
    console.error("Analysis API error:", error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 502 }
      );
    }

    const aiError = error as { status?: number; message?: string };

    if (aiError.status === 429) {
      return Response.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: (error as Error)?.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
