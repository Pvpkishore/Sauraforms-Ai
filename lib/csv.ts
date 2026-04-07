import type { FormResponseRecord, FormSchema } from "@/lib/types";

function escapeCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function responsesToCsv(form: FormSchema, responses: FormResponseRecord[]) {
  const headers = ["submission_id", "submitted_at", ...form.fields.map((field) => field.label)];
  const rows = responses.map((response) => [
    response.id,
    response.submittedAt,
    ...form.fields.map((field) => String(response.values[field.id] ?? ""))
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
    .join("\n");
}