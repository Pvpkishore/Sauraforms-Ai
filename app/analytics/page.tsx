"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentFormId, subscribeToStorageChanges } from "@/lib/storage";
import { getForm, getForms, getResponses } from "@/lib/storageAdapter";
import { formatRelativeDate } from "@/lib/utils";
import type { FormResponseRecord, FormSchema } from "@/lib/types";

export default function AnalyticsPage() {
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<FormSchema | null>(null);
  const [responses, setResponses] = useState<FormResponseRecord[]>([]);

  // Load form detail + responses whenever selectedFormId changes
  useEffect(() => {
    if (!selectedFormId) {
      setSelectedForm(null);
      setResponses([]);
      return;
    }
    const load = async () => {
      const [form, resps] = await Promise.all([
        getForm(selectedFormId),
        getResponses(selectedFormId)
      ]);
      setSelectedForm(form);
      setResponses(resps);
    };
    void load();
  }, [selectedFormId]);

  useEffect(() => {
    const refresh = async () => {
      const storedForms = await getForms();
      setForms(storedForms);
      setSelectedFormId((current) => {
        if (current && storedForms.some((form) => form.id === current)) {
          return current;
        }
        return getCurrentFormId() ?? storedForms[0]?.id ?? "";
      });
    };

    void refresh();
    const unsubscribe = subscribeToStorageChanges(() => void refresh());

    return unsubscribe;
  }, []);

  // selectedForm + responses are now managed by the useEffect above
  // (removed useMemo-based synchronous selectors)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>Analytics</Badge>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Response intelligence</h1>
          <p className="mt-2 text-muted-foreground">Inspect total submissions, answer coverage, and dropdown distributions.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Form</label>
          <select
            value={selectedFormId}
            onChange={(event) => setSelectedFormId(event.target.value)}
            className="min-w-[260px] bg-transparent text-sm outline-none"
          >
            {forms.length ? (
              forms.map((form) => (
                <option key={form.id} value={form.id} className="bg-slate-950">
                  {form.title}
                </option>
              ))
            ) : (
              <option value="">No forms yet</option>
            )}
          </select>
        </div>
      </div>

      {selectedForm ? (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Total submissions</CardDescription>
                <CardTitle className="text-4xl">{responses.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Fields in form</CardDescription>
                <CardTitle className="text-4xl">{selectedForm.fields.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Last updated</CardDescription>
                <CardTitle className="text-xl">{formatRelativeDate(selectedForm.updatedAt)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <AnalyticsCharts form={selectedForm} responses={responses} />

          <Button asChild variant="secondary">
            <Link href={`/responses/${selectedForm.id}`}>Open detailed responses</Link>
          </Button>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No forms available</CardTitle>
            <CardDescription>Generate a form first to unlock analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Create a form</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}