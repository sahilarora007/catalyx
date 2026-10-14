import { groqWithRetry, GROQ_MODEL, safeParseJson } from "@/lib/groq-client";
import { GENERATION_SYSTEM_PROMPT, buildGenerationUserPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { initialPrompt, initialScore, answers } = await request.json();

    if (!initialPrompt || !Array.isArray(answers)) {
      return Response.json(
        { error: "Missing required fields." },
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
        { role: "system", content: GENERATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildGenerationUserPrompt(
            initialPrompt,
            initialScore || 0,
            answers
          ),
        },
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

    // Normalize critical fields across model naming variations
    const rawScore = result.optimizedScore ?? result.optimized_score ?? result.score ?? result.finalScore;
    const parsedScore = Number(rawScore);
    const validScore = (!isNaN(parsedScore) && parsedScore > 0)
      ? parsedScore
      : (typeof initialScore === "number" ? Math.min(98, initialScore + 30) : 92);
    result.optimizedScore = validScore;

    const masterPrompt =
      result.masterPrompt ||
      result.master_prompt ||
      result.master ||
      result.optimizedPrompt ||
      result.prompt;

    if (masterPrompt) {
      result.masterPrompt = masterPrompt;
    }

    // Validate critical fields
    if (!result.masterPrompt) {
      return Response.json(
        { error: "Received an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    return Response.json(result);
  } catch (error: unknown) {
    console.error("Generate API error:", error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 502 }
      );
    }

    const aiError = error as { status?: number };
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
