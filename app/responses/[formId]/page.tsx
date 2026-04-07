"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { responsesToCsv } from "@/lib/csv";
import { downloadTextFile } from "@/lib/storage";
import { clearResponses, deleteResponse, getForm, getResponses } from "@/lib/storageAdapter";
import { formatRelativeDate } from "@/lib/utils";
import type { FormResponseRecord, FormSchema } from "@/lib/types";

export default function ResponsesPage({ params }: { params: { formId: string } }) {
  const [form, setForm] = useState<FormSchema | null>(null);
  const [responses, setResponses] = useState<FormResponseRecord[]>([]);

  const handleDeleteResponse = async (responseId: string) => {
    const next = await deleteResponse(params.formId, responseId);
    setResponses(next);
    toast.success("Response deleted.");
  };

  const handleClearResponses = async () => {
    await clearResponses(params.formId);
    setResponses([]);
    toast.success("All responses cleared.");
  };

  useEffect(() => {
    const load = async () => {
      const [nextForm, nextResponses] = await Promise.all([
        getForm(params.formId),
        getResponses(params.formId)
      ]);
      setForm(nextForm);
      setResponses(nextResponses);
    };
    void load();
  }, [params.formId]);

  if (!form) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response view unavailable</CardTitle>
          <CardDescription>Save a form locally first, then revisit this route.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>Responses</Badge>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{form.title}</h1>
          <p className="mt-2 text-muted-foreground">{responses.length} locally stored submissions for this form.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/analytics">Back to analytics</Link>
          </Button>
          <Button variant="outline" onClick={handleClearResponses} disabled={!responses.length}>
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
          <Button
            onClick={() => {
              downloadTextFile(`${form.id}-responses.csv`, responsesToCsv(form, responses), "text/csv;charset=utf-8");
              toast.success("CSV export downloaded.");
            }}
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      <AIInsightsPanel form={form} responses={responses} />

      <div className="space-y-4">
        {responses.length ? (
          responses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Submission {response.id}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteResponse(response.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
                <CardDescription>{formatRelativeDate(response.submittedAt)}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {form.fields.map((field) => (
                  <div key={field.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{field.label}</p>
                    <p className="mt-2 text-sm text-foreground">{String(response.values[field.id] ?? "-")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No responses yet</CardTitle>
              <CardDescription>Open the public form route and submit a few entries to populate this view.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}