import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeSchema } from "@/lib/formParser";
import type { FormSchema } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      instruction?: string;
      formSchema?: FormSchema;
    };

    if (!body.instruction || !body.formSchema) {
      return NextResponse.json({ error: "Missing instruction or formSchema." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 503 });
    }

    const { instruction, formSchema } = body;
    const client = new OpenAI({ apiKey });

    const fieldList = formSchema.fields
      .map((f, i) => `${i + 1}. ${f.label} (${f.type})${f.required ? " [required]" : ""}`)
      .join("\n");

    const userMessage = `
Current form:
Title: "${formSchema.title}"
Description: "${formSchema.description}"
Fields:
${fieldList}

User instruction: "${instruction}"

Apply the instruction to the form and return the COMPLETE updated form schema as JSON.
Only modify what the instruction asks — preserve unchanged fields exactly.
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate production-ready web form schemas. Return strict JSON with keys title, description, and fields. Each field must include type, label, optional placeholder, optional description, optional required, optional validation, and optional string options for dropdowns. Allowed types: text, email, number, textarea, select, checkbox, file."
        },
        { role: "user", content: userMessage }
      ]
    });

    const payload = completion.choices[0]?.message?.content;
    if (!payload) {
      return NextResponse.json({ error: "Empty AI response." }, { status: 500 });
    }

    const updated = normalizeSchema(JSON.parse(payload), formSchema.prompt);
    // Preserve the original form's identity
    updated.id = formSchema.id;
    updated.prompt = formSchema.prompt;
    updated.createdAt = formSchema.createdAt;

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply edit." },
      { status: 500 }
    );
  }
}
