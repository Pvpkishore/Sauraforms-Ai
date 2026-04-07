import { z } from "zod";

import { generateId, slugify } from "@/lib/utils";
import type { FieldType, FormField, FormSchema, TemplateDefinition } from "@/lib/types";

const aiFieldSchema = z.object({
  type: z.enum(["text", "email", "number", "textarea", "select", "checkbox", "file"]),
  label: z.string(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional()
    })
    .optional()
});

const aiResponseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(aiFieldSchema).min(1)
});

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Short text",
  email: "Email",
  number: "Number",
  textarea: "Long answer",
  select: "Dropdown",
  checkbox: "Checkbox",
  file: "File upload"
};

export function createEmptyField(type: FieldType = "text"): FormField {
  return {
    id: generateId("field"),
    type,
    label: fieldTypeLabels[type],
    placeholder: type === "select" || type === "checkbox" || type === "file" ? undefined : "",
    required: false,
    options:
      type === "select"
        ? [
            { id: generateId("opt"), label: "Option 1", value: "option-1" },
            { id: generateId("opt"), label: "Option 2", value: "option-2" }
          ]
        : undefined,
    validation: {}
  };
}

export function normalizeSchema(input: unknown, prompt: string): FormSchema {
  const parsed = aiResponseSchema.parse(input);
  const title = parsed.title?.trim() || inferTitleFromPrompt(prompt);

  return {
    id: slugify(title) || generateId("form"),
    title,
    description: parsed.description?.trim() || "Built with AI and ready to publish.",
    prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: parsed.fields.map((field) => ({
      id: generateId("field"),
      type: field.type,
      label: field.label.trim(),
      placeholder: field.placeholder?.trim(),
      description: field.description?.trim(),
      required: field.required ?? false,
      options:
        field.options?.map((option) => {
          const value = slugify(option);
          return {
            id: generateId("opt"),
            label: option,
            value: value || generateId("option")
          };
        }) ?? undefined,
      validation: field.validation
    }))
  };
}

export function inferTitleFromPrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return "Untitled form";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1, 48);
}

export function buildFallbackSchema(prompt: string): FormSchema {
  const lower = prompt.toLowerCase();
  const fields: FormField[] = [];

  if (/(name|full name)/.test(lower)) {
    fields.push({ ...createEmptyField("text"), label: "Full name", required: true, placeholder: "Enter your full name" });
  }
  if (/email/.test(lower)) {
    fields.push({ ...createEmptyField("email"), label: "Email address", required: true, placeholder: "you@example.com" });
  }
  if (/(phone|contact)/.test(lower)) {
    fields.push({ ...createEmptyField("text"), label: "Phone number", placeholder: "+1 (555) 000-0000" });
  }
  if (/(resume|cv|upload)/.test(lower)) {
    fields.push({ ...createEmptyField("file"), label: "Resume", required: true, description: "PDF or DOC up to 10MB" });
  }
  if (/(experience|years)/.test(lower)) {
    fields.push({ ...createEmptyField("number"), label: "Years of experience", required: true, validation: { min: 0, max: 50 } });
  }
  if (/(feedback|message|cover letter|notes)/.test(lower)) {
    fields.push({ ...createEmptyField("textarea"), label: "Additional details", placeholder: "Share the context you need" });
  }

  if (fields.length === 0) {
    fields.push(
      { ...createEmptyField("text"), label: "Name", required: true, placeholder: "Jane Doe" },
      { ...createEmptyField("email"), label: "Email", required: true, placeholder: "jane@example.com" },
      { ...createEmptyField("textarea"), label: "Response", placeholder: "Type your answer" }
    );
  }

  return {
    id: slugify(inferTitleFromPrompt(prompt)) || generateId("form"),
    title: inferTitleFromPrompt(prompt),
    description: "AI generated starter form. Refine fields in the builder.",
    prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields
  };
}

export const promptSuggestions = [
  "Create a polished client intake form for a design agency with company details, project budget, timeline, and goals.",
  "Build a startup hiring form for frontend engineers with name, email, LinkedIn, resume upload, and years of React experience.",
  "Generate a luxury hotel guest feedback form with stay rating, room type, dining rating, and open feedback.",
  "Make a SaaS waitlist form with name, work email, company size, use case, and monthly budget."
];

export const templates: TemplateDefinition[] = [
  {
    id: "job",
    name: "Job application",
    description: "Hiring-ready form with uploads and experience capture.",
    prompt: "Create a job application form with full name, email, phone number, LinkedIn profile, resume upload, years of experience, and a cover letter."
  },
  {
    id: "survey",
    name: "Customer survey",
    description: "Collect ratings, segments, and qualitative feedback.",
    prompt: "Create a customer satisfaction survey with name, email, NPS score, favorite feature dropdown, improvement suggestions, and checkbox consent to follow up."
  },
  {
    id: "feedback",
    name: "Product feedback",
    description: "Ideal for beta launches and roadmap feedback.",
    prompt: "Create a product feedback form with name, email, company role, feature rating dropdown, bug report details, and additional comments."
  },
  {
    id: "event",
    name: "Event registration",
    description: "Capture attendees, ticket tiers, and preferences.",
    prompt: "Create an event registration form with full name, email, phone number, company name, ticket type dropdown, dietary preference dropdown, and a consent checkbox."
  },
  {
    id: "lead",
    name: "B2B lead qualification",
    description: "Qualify inbound leads with budget and urgency.",
    prompt: "Create a B2B lead qualification form with name, work email, company, job title, team size dropdown, monthly budget range dropdown, purchase timeline dropdown, and project requirements textarea."
  },
  {
    id: "support",
    name: "Support ticket",
    description: "Collect issue severity and technical context.",
    prompt: "Create a support request form with full name, email, product area dropdown, issue severity dropdown, steps to reproduce textarea, attachment upload, and preferred contact method dropdown."
  }
];