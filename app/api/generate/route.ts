import Groq from "groq-sdk";
import { GENERATION_SYSTEM_PROMPT, buildGenerationUserPrompt } from "@/lib/prompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "API key not configured. Please add GROQ_API_KEY to your environment." },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
      max_tokens: 8192,
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

    // Validate critical fields
    if (!result.masterPrompt || typeof result.optimizedScore !== "number") {
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

    const groqError = error as { status?: number };
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
