import Groq from "groq-sdk";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/lib/prompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "API key not configured. Please add GROQ_API_KEY to your environment." },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildAnalysisUserPrompt(prompt.trim()) },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI. Please try again." },
        { status: 502 }
      );
    }

    const result = JSON.parse(content);

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

    const groqError = error as { status?: number; message?: string };

    if (groqError.status === 429) {
      return Response.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
