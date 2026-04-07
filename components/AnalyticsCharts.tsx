"use client";

import { BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormResponseRecord, FormSchema } from "@/lib/types";

const COLORS = ["#8b5cf6", "#38bdf8", "#22d3ee", "#14b8a6", "#f59e0b"];

function buildFieldBreakdown(form: FormSchema, responses: FormResponseRecord[]) {
  return form.fields.map((field) => ({
    name: field.label,
    count: responses.filter((response) => Boolean(response.values[field.id])).length
  }));
}

function buildSelectBreakdown(form: FormSchema, responses: FormResponseRecord[]) {
  const selectableField = form.fields.find((field) => field.type === "select");

  if (!selectableField?.options?.length) {
    return [];
  }

  return selectableField.options.map((option) => ({
    name: option.label,
    value: responses.filter((response) => response.values[selectableField.id] === option.value).length
  }));
}

export function AnalyticsCharts({ form, responses }: { form: FormSchema; responses: FormResponseRecord[] }) {
  const completion = buildFieldBreakdown(form, responses);
  const distribution = buildSelectBreakdown(form, responses);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Field completion</CardTitle>
          <CardDescription>How often each question receives a value across stored submissions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selection distribution</CardTitle>
          <CardDescription>Rendered when the form contains a dropdown field.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          {distribution.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={108} paddingAngle={4}>
                  {distribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-muted-foreground">
              Add a dropdown field to see categorical breakdowns.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}