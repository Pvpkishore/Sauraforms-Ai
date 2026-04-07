"use client";

import { create } from "zustand";

import { saveForm } from "@/lib/storage";
import type { FormField, FormSchema } from "@/lib/types";

interface BuilderState {
  currentForm: FormSchema;
  prompt: string;
  isGenerating: boolean;
  setPrompt: (prompt: string) => void;
  setIsGenerating: (value: boolean) => void;
  setCurrentForm: (form: FormSchema) => void;
  updateFormMeta: (values: Partial<Pick<FormSchema, "title" | "description">>) => void;
  addField: (field: FormField) => void;
  updateField: (fieldId: string, patch: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  reorderFields: (nextFields: FormField[]) => void;
  resetBuilder: () => void;
  persistCurrentForm: () => void;
}

const starterForm: FormSchema = {
  id: "starter-client-onboarding",
  title: "Client onboarding form",
  description: "Capture project basics before kickoff.",
  prompt: "Create a client onboarding form with name, email, budget, and project goals.",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  fields: [
    {
      id: "field_name",
      type: "text",
      label: "Full name",
      placeholder: "Enter your full name",
      required: true,
      validation: {}
    },
    {
      id: "field_email",
      type: "email",
      label: "Email address",
      placeholder: "you@example.com",
      required: true,
      validation: {}
    },
    {
      id: "field_budget",
      type: "number",
      label: "Estimated budget",
      placeholder: "5000",
      required: false,
      validation: { min: 0 }
    },
    {
      id: "field_goals",
      type: "textarea",
      label: "Project goals",
      placeholder: "Describe what success looks like.",
      required: false,
      validation: {}
    }
  ]
};

export const useFormBuilderStore = create<BuilderState>((set, get) => ({
  currentForm: starterForm,
  prompt: starterForm.prompt,
  isGenerating: false,
  setPrompt: (prompt) => set({ prompt }),
  setIsGenerating: (value) => set({ isGenerating: value }),
  setCurrentForm: (form) => set({ currentForm: form, prompt: form.prompt }),
  updateFormMeta: (values) =>
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        ...values,
        updatedAt: new Date().toISOString()
      }
    })),
  addField: (field) =>
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        fields: [...state.currentForm.fields, field],
        updatedAt: new Date().toISOString()
      }
    })),
  updateField: (fieldId, patch) =>
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        fields: state.currentForm.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
        updatedAt: new Date().toISOString()
      }
    })),
  removeField: (fieldId) =>
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        fields: state.currentForm.fields.filter((field) => field.id !== fieldId),
        updatedAt: new Date().toISOString()
      }
    })),
  reorderFields: (nextFields) =>
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        fields: nextFields,
        updatedAt: new Date().toISOString()
      }
    })),
  resetBuilder: () => set({ currentForm: starterForm, prompt: starterForm.prompt }),
  persistCurrentForm: () => {
    const { currentForm } = get();
    saveForm(currentForm);
  }
}));