"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { promptSuggestions } from "@/lib/formParser";
import { cn } from "@/lib/utils";

interface AIInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: (prompt: string) => Promise<void> | void;
  isLoading?: boolean;
  compact?: boolean;
}

export function AIInputBox({ value, onChange, onGenerate, isLoading = false, compact = false }: AIInputBoxProps) {
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  return (
    <Card className={cn("animated-border overflow-hidden rounded-[28px] p-0", compact && "rounded-3xl") }>
      <div className="bg-aura p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Prompt-to-form generation
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Describe the form you want.</h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground md:block">
            OpenAI structured generation
          </div>
        </div>

        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Create a job application form with name, email, resume upload, and experience"
          className="min-h-[140px] bg-black/20 text-base"
        />

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-left text-xs transition",
                  activeSuggestion === index ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
                )}
                onMouseEnter={() => setActiveSuggestion(index)}
                onClick={() => onChange(suggestion)}
              >
                {index === 0 ? "Startup hiring" : index === 1 ? "Agency intake" : index === 2 ? "Hotel feedback" : "SaaS waitlist"}
              </button>
            ))}
          </div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button type="button" size="lg" onClick={() => onGenerate(value)} disabled={isLoading}>
              <Wand2 className="h-4 w-4" />
              {isLoading ? "Generating form..." : "Generate with AI"}
            </Button>
          </motion.div>
        </div>
      </div>
    </Card>
  );
}