"use client";

import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormResponseRecord, FormSchema } from "@/lib/types";

interface InsightsResult {
  summary: string;
  topInsights: string[];
  sentimentScore: number;
}

interface AIInsightsPanelProps {
  form: FormSchema;
  responses: FormResponseRecord[];
}

export function AIInsightsPanel({ form, responses }: AIInsightsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formSchema: form, responses })
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Failed to generate insights.");
      }

      const data = (await res.json()) as InsightsResult;
      setInsights(data);
      setOpen(true);
      toast.success("AI insights ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    !insights || insights.sentimentScore <= 2
      ? "text-red-400"
      : insights.sentimentScore <= 3
        ? "text-yellow-400"
        : "text-emerald-400";

  return (
    <Card className="border-violet-500/20 bg-violet-500/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {insights && (
              <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            <Button size="sm" onClick={generate} disabled={loading}>
              <TrendingUp className="h-4 w-4" />
              {loading ? "Analysing…" : insights ? "Refresh" : "Generate insights"}
            </Button>
          </div>
        </div>
        <CardDescription>
          {responses.length > 0
            ? `Analyse ${responses.length} response${responses.length > 1 ? "s" : ""} with AI to uncover patterns and themes.`
            : "No responses yet — insights will generate a structural summary of your form."}
        </CardDescription>
      </CardHeader>

      {open && insights && (
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{insights.summary}</p>

          <div className="space-y-2">
            {insights.topInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/5 p-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300">
                  {idx + 1}
                </span>
                <span>{insight}</span>
              </div>
            ))}
          </div>

          {insights.sentimentScore > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              <span>Overall quality score:</span>
              <span className={`font-semibold ${scoreColor}`}>{insights.sentimentScore} / 5</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
