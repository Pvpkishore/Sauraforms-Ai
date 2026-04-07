import { NextResponse } from "next/server";

import { generateFormSchema } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const schema = await generateFormSchema(prompt);
    return NextResponse.json(schema);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate form." },
      { status: 500 }
    );
  }
}