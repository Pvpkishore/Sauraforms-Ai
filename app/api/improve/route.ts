import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeSchema } from "@/lib/formParser";
import type { FormSchema } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { formSchema?: FormSchema };

    if (!body.formSchema) {
      return NextResponse.json({ error: "Missing formSchema." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 503 });
    }

    const { formSchema } = body;
    const client = new OpenAI({ apiKey });

    const fieldList = formSchema.fields
      .map((f, i) => `${i + 1}. ${f.label} (${f.type})${f.required ? " [required]" : ""}${f.description ? ` — ${f.description}` : ""}`)
      .join("\n");

    const userMessage = `
Improve the following form to be more professional, clear, and user-friendly.

Current form:
Title: "${formSchema.title}"
Description: "${formSchema.description}"
Fields:
${fieldList}

Instructions:
- Sharpen field labels to be specific and action-oriented
- Add concise, helpful placeholder text for all applicable fields
- Add a short helper description to any unclear fields
- Ensure field types are the most appropriate for each field
- Suggest adding any commonly missing fields for this form type
- Give the form a polished, professional title and description
- Keep the same number of fields (±2)

Return the complete improved form as JSON with keys: title, description, fields.
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

    const improved = normalizeSchema(JSON.parse(payload), formSchema.prompt);
    // Preserve the original form's identity
    improved.id = formSchema.id;
    improved.prompt = formSchema.prompt;
    improved.createdAt = formSchema.createdAt;

    return NextResponse.json(improved);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to improve form." },
      { status: 500 }
    );
  }
}
