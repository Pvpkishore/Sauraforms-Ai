"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Download, MessageSquare, RefreshCcw, Send, Share2, Sparkles, Wand2, Zap } from "lucide-react";
import { toast } from "sonner";

import { AIInputBox } from "@/components/AIInputBox";
import { DragDropBuilder } from "@/components/DragDropBuilder";
import { FormRenderer } from "@/components/FormRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEmptyField } from "@/lib/formParser";
import { downloadTextFile, exportFormSnapshot, getCurrentFormId, setCurrentFormId } from "@/lib/storage";
import { deleteForm, getForm, saveForm } from "@/lib/storageAdapter";
import { useFormBuilderStore } from "@/hooks/use-form-builder-store";
import type { FormSchema } from "@/lib/types";

export default function BuilderPage() {
  const [editInstruction, setEditInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const {
    currentForm,
    prompt,
    isGenerating,
    setPrompt,
    setCurrentForm,
    setIsGenerating,
    updateFormMeta,
    addField,
    updateField,
    removeField,
    reorderFields,
    resetBuilder
  } = useFormBuilderStore();

  useEffect(() => {
    const load = async () => {
      const existingId = getCurrentFormId();
      if (!existingId) return;
      const existingForm = await getForm(existingId);
      if (existingForm) setCurrentForm(existingForm);
    };
    void load();
  }, [setCurrentForm]);

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
        throw new Error(errorPayload?.error || "Unable to generate form.");
      }

      const schema = (await response.json()) as FormSchema;
      setCurrentForm(schema);
      await saveForm(schema);
      setCurrentFormId(schema.id);
      toast.success("Form regenerated from prompt.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate a form from that prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    try {
      setIsImproving(true);
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formSchema: currentForm })
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Unable to improve form.");
      }
      const improved = (await res.json()) as FormSchema;
      setCurrentForm(improved);
      await saveForm(improved);
      toast.success("Form improved with AI.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to improve form.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleEdit = async () => {
    if (!editInstruction.trim()) return;
    try {
      setIsEditing(true);
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: editInstruction.trim(), formSchema: currentForm })
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Unable to apply edit.");
      }
      const updated = (await res.json()) as FormSchema;
      setCurrentForm(updated);
      await saveForm(updated);
      setEditInstruction("");
      toast.success("Form updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply edit.");
    } finally {
      setIsEditing(false);
    }
  };

  const saveCurrent = async () => {
    await saveForm(currentForm);
    setCurrentFormId(currentForm.id);
    toast.success("Form saved.");
  };

  const duplicateCurrent = async () => {
    const copy = {
      ...currentForm,
      id: `${currentForm.id}-${crypto.randomUUID().slice(0, 4)}`,
      title: `${currentForm.title} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentForm(copy);
    await saveForm(copy);
    toast.success("Form duplicated.");
  };

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/form/${currentForm.id}?snapshot=${encodeURIComponent(exportFormSnapshot(currentForm))}` : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <AIInputBox value={prompt} onChange={setPrompt} onGenerate={handleGenerate} isLoading={isGenerating} compact />

          <Card>
            <CardHeader>
              <CardTitle>Form identity</CardTitle>
              <CardDescription>Polish the generated form before publishing or exporting.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Input value={currentForm.title} onChange={(event) => updateFormMeta({ title: event.target.value })} placeholder="Form title" />
              <Input
                value={currentForm.description}
                onChange={(event) => updateFormMeta({ description: event.target.value })}
                placeholder="Form description"
              />
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button onClick={saveCurrent}>
                  <Sparkles className="h-4 w-4" />
                  Save form
                </Button>
                <Button variant="secondary" onClick={duplicateCurrent}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    downloadTextFile(`${currentForm.id}.json`, JSON.stringify(currentForm, null, 2));
                    toast.success("JSON export downloaded.");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button variant="secondary" onClick={() => { resetBuilder(); toast.success("Builder reset."); }}>
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareLink);
                    toast.success("Share link copied.");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Copy share link
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/preview">Full preview</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Assist panel */}
          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-400" />
                  <CardTitle className="text-lg">AI Assist</CardTitle>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleImprove}
                  disabled={isImproving || isGenerating}
                >
                  <Wand2 className="h-4 w-4" />
                  {isImproving ? "Improving…" : "Improve form"}
                </Button>
              </div>
              <CardDescription>Ask AI to tweak this form in plain English, or let it auto-improve labels, descriptions and field types.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleEdit();
                    }}
                    placeholder="e.g. Add a phone number field, make all fields required, change title to …"
                    className="min-h-0 resize-none pl-9 text-sm"
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isEditing || !editInstruction.trim()}
                  className="self-start mt-0.5"
                >
                  <Send className="h-4 w-4" />
                  {isEditing ? "Applying…" : "Apply"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <DragDropBuilder
            fields={currentForm.fields}
            onAddField={(type) => addField(createEmptyField(type))}
            onUpdateField={updateField}
            onRemoveField={removeField}
            onReorder={reorderFields}
          />
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <FormRenderer form={currentForm} />
        </div>
      </div>
    </div>
  );
}