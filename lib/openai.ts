import OpenAI from "openai";

import { buildFallbackSchema, normalizeSchema } from "@/lib/formParser";
import type { FormSchema } from "@/lib/types";

export async function generateFormSchema(prompt: string): Promise<FormSchema> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackSchema(prompt);
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate production-ready web form schemas. Return strict JSON with keys title, description, and fields. Each field must include type, label, optional placeholder, optional description, optional required, optional validation, and optional string options for dropdowns. Allowed types: text, email, number, textarea, select, checkbox, file."
        },
        {
          role: "user",
          content: `Create a form schema for this request: ${prompt}`
        }
      ]
    });

    const payload = completion.choices[0]?.message?.content;

    if (!payload) {
      return buildFallbackSchema(prompt);
    }

    try {
      return normalizeSchema(JSON.parse(payload), prompt);
    } catch {
      return buildFallbackSchema(prompt);
    }
  } catch {
    // If OpenAI fails (invalid key, rate limits, model access), keep UX functional.
    return buildFallbackSchema(prompt);
  }
}