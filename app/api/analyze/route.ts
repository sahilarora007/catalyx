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
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI. Please try again." },
        { status: 502 }
      );
    }

    const result = safeParseJson<any>(content);

    // Validate required fields
    if (
      typeof result.initialScore !== "number" ||
      !Array.isArray(result.missingRequirements) ||
      !Array.isArray(result.interviewQuestions)
    ) {
      return Response.json(
        { error: "Received an invalid response format. Please try again." },
        { status: 502 }
      );
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
