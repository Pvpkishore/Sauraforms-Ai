"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, LayoutPanelTop, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { AIInputBox } from "@/components/AIInputBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormBuilderStore } from "@/hooks/use-form-builder-store";
import { templates } from "@/lib/formParser";
import { saveForm } from "@/lib/storageAdapter";
import type { FormSchema } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(templates[0].prompt);
  const { setCurrentForm, setIsGenerating } = useFormBuilderStore();

  const handleGenerate = async (nextPrompt: string) => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nextPrompt })
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorPayload?.error || "Failed to generate form.");
      }

      const schema = (await response.json()) as FormSchema;
      setCurrentForm(schema);
      await saveForm(schema);
      toast.success("AI form created.");
      router.push("/builder");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-aura p-8 shadow-glass">
          <Badge>AI Form Builder SaaS</Badge>
          <div className="max-w-3xl space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl"
            >
              Turn plain-language prompts into <span className="gradient-text">production-ready forms</span>.
            </motion.h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Generate, refine, preview, share, and analyze dynamic forms in one premium studio. No auth. No backend. No dead weight.
            </p>
          </div>

          <AIInputBox value={prompt} onChange={setPrompt} onGenerate={handleGenerate} />

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/builder">
                Explore builder
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/analytics">View analytics</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5">
          {[
            { title: "Prompt to schema", description: "OpenAI converts natural language into structured, validated form JSON.", icon: WandSparkles },
            { title: "Live split-screen studio", description: "Drag fields on the left, watch the final form update on the right.", icon: LayoutPanelTop },
            { title: "Local response intelligence", description: "Persist submissions, export CSV, and inspect chart-based analytics instantly.", icon: BarChart3 }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="group transition hover:-translate-y-1 hover:border-primary/30">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4">
              <p className="text-sm text-muted-foreground">{template.prompt}</p>
              <Button size="sm" variant="secondary" onClick={() => setPrompt(template.prompt)}>
                Use template
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}