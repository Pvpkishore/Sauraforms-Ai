"use client";

import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateId } from "@/lib/utils";
import { saveResponse } from "@/lib/storageAdapter";
import type { FormField, FormResponseRecord, FormSchema } from "@/lib/types";

function createValidation(field: FormField) {
  switch (field.type) {
    case "email": {
      if (!field.required) {
        return z.union([z.string().email("Enter a valid email address."), z.literal("")]);
      }
      return z.string().email("Enter a valid email address.");
    }
    case "number": {
      return z.coerce.number({ invalid_type_error: "Enter a valid number." });
    }
    case "checkbox": {
      return field.required ? z.boolean().refine(Boolean, "This field is required.") : z.boolean().optional();
    }
    case "file": {
      return field.required ? z.string().min(1, "Upload is required.") : z.string().optional();
    }
    default: {
      let schema = z.string();
      if (field.required) {
        schema = schema.min(1, `${field.label} is required.`);
      }
      if (field.validation?.minLength) {
        schema = schema.min(field.validation.minLength);
      }
      if (field.validation?.maxLength) {
        schema = schema.max(field.validation.maxLength);
      }
      if (!field.required) {
        schema = schema.optional().transform((value) => value ?? "") as unknown as z.ZodString;
      }
      return schema;
    }
  }
}

function buildZodSchema(form: FormSchema) {
  const shape = form.fields.reduce<Record<string, z.ZodTypeAny>>((accumulator, field) => {
    accumulator[field.id] = createValidation(field);
    return accumulator;
  }, {});

  return z.object(shape);
}

interface FormRendererProps {
  form: FormSchema;
  mode?: "preview" | "public";
  onSubmitted?: (response: FormResponseRecord) => void;
}

export function FormRenderer({ form, mode = "preview", onSubmitted }: FormRendererProps) {
  const schema = useMemo(() => buildZodSchema(form), [form]);
  const formMethods = useForm<Record<string, string | number | boolean>>({
    resolver: zodResolver(schema),
    defaultValues: form.fields.reduce<Record<string, string | number | boolean>>((accumulator, field) => {
      accumulator[field.id] = field.type === "checkbox" ? false : "";
      return accumulator;
    }, {})
  });

  const onSubmit = formMethods.handleSubmit(async (values) => {
    const response: FormResponseRecord = {
      id: generateId("response"),
      formId: form.id,
      submittedAt: new Date().toISOString(),
      values
    };

    await saveResponse(form.id, response);
    formMethods.reset();
    toast.success("Response submitted.");
    onSubmitted?.(response);
  });

  return (
    <Card className="rounded-[28px]">
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        <CardDescription>{form.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          {form.fields.map((field) => {
            const errorMessage = formMethods.formState.errors[field.id]?.message as string | undefined;

            return (
              <div key={field.id} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {field.label}
                  {field.required ? <span className="text-primary">*</span> : null}
                </label>
                {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}

                {field.type === "textarea" ? (
                  <Textarea placeholder={field.placeholder} {...formMethods.register(field.id)} />
                ) : null}

                {field.type === "text" || field.type === "email" || field.type === "number" ? (
                  <Input type={field.type === "text" ? "text" : field.type} placeholder={field.placeholder} {...formMethods.register(field.id)} />
                ) : null}

                {field.type === "select" ? (
                  <select
                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30 dark:bg-white/[0.03]"
                    {...formMethods.register(field.id)}
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}

                {field.type === "checkbox" ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-primary" {...formMethods.register(field.id)} />
                    <span>I confirm this statement.</span>
                  </label>
                ) : null}

                {field.type === "file" ? (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      onChange={(event) => {
                        const fileName = event.target.files?.[0]?.name ?? "";
                        formMethods.setValue(field.id, fileName, { shouldValidate: true });
                      }}
                    />
                    <input type="hidden" {...formMethods.register(field.id)} />
                  </div>
                ) : null}

                {errorMessage ? <p className="text-xs text-rose-400">{errorMessage}</p> : null}
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-xs text-muted-foreground">
              {mode === "public" ? "Responses are stored locally in this browser session." : "Preview uses the live validation schema."}
            </p>
            <Button type="submit">Submit form</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}