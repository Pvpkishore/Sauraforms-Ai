import OpenAI from "openai";
import { NextResponse } from "next/server";

import type { FormResponseRecord, FormSchema } from "@/lib/types";

export interface InsightsResult {
  summary: string;
  topInsights: string[];
  sentimentScore: number;
}

function buildFallbackInsights(form: FormSchema, responses: FormResponseRecord[]): InsightsResult {
  const requiredFields = form.fields.filter((f) => f.required).length;
  const textFields = form.fields.filter((f) => f.type === "text" || f.type === "textarea" || f.type === "email").length;

  // Calculate average field completion per response
  let totalFilled = 0;
  for (const resp of responses) {
    for (const field of form.fields) {
      const val = resp.values[field.id];
      if (val !== undefined && val !== null && val !== "" && val !== false) totalFilled++;
    }
  }
  const avgFill = responses.length > 0 ? Math.round((totalFilled / (responses.length * form.fields.length)) * 100) : 0;

  return {
    summary: `"${form.title}" has collected ${responses.length} response${responses.length !== 1 ? "s" : ""} across ${form.fields.length} fields. Average field completion stands at ${avgFill}%.`,
    topInsights: [
      `${responses.length} total submission${responses.length !== 1 ? "s" : ""} recorded`,
      `${requiredFields} of ${form.fields.length} fields are required`,
      `${textFields} text-based fields capture qualitative input`,
      `Average field completion: ${avgFill}%`
    ],
    sentimentScore: 3
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      formSchema?: FormSchema;
      responses?: FormResponseRecord[];
    };

    if (!body.formSchema || !body.responses) {
      return NextResponse.json({ error: "Missing formSchema or responses." }, { status: 400 });
    }

    const { formSchema, responses } = body;

    if (responses.length === 0) {
      return NextResponse.json(buildFallbackInsights(formSchema, responses));
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(buildFallbackInsights(formSchema, responses));
    }

    const client = new OpenAI({ apiKey });

    // Build a compact response sample (max 20) for the AI prompt
    const responseSample = responses.slice(0, 20).map((r) => {
      const vals: Record<string, string> = {};
      formSchema.fields.forEach((f) => {
        const v = r.values[f.id];
        if (v !== undefined && v !== null && v !== "") {
          vals[f.label] = String(v);
        }
      });
      return vals;
    });

    const userMessage = `
Form: "${formSchema.title}"
Fields: ${formSchema.fields.map((f) => `${f.label} (${f.type})`).join(", ")}
Total responses: ${responses.length}
Sample (up to 20):
${JSON.stringify(responseSample, null, 2)}

Return JSON with:
- summary: string — 2-3 sentences summarising what the responses reveal
- topInsights: string[] — 4-5 concise, actionable bullet-point insights
- sentimentScore: number — overall quality/positivity score from 1 to 5
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a data analyst summarising form response data for a dashboard. Return only valid JSON with keys: summary (string), topInsights (string[]), sentimentScore (number 1-5)."
        },
        { role: "user", content: userMessage }
      ]
    });

    const payload = completion.choices[0]?.message?.content;
    if (!payload) {
      return NextResponse.json(buildFallbackInsights(formSchema, responses));
    }

    const result = JSON.parse(payload) as InsightsResult;
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate insights." },
      { status: 500 }
    );
  }
}
