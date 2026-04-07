import { Schema, model, models } from "mongoose";

import type { FieldOption, FieldValidation, FormField, FormSchema } from "@/lib/types";

const fieldOptionSchema = new Schema<FieldOption>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const fieldValidationSchema = new Schema<FieldValidation>(
  {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String
  },
  { _id: false }
);

const formFieldSchema = new Schema<FormField>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["text", "email", "number", "textarea", "select", "checkbox", "file"]
    },
    label: { type: String, required: true },
    placeholder: String,
    description: String,
    required: { type: Boolean, default: false },
    options: [fieldOptionSchema],
    validation: fieldValidationSchema
  },
  { _id: false }
);

const formSchema = new Schema<FormSchema>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    prompt: { type: String, default: "" },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    fields: { type: [formFieldSchema], default: [] }
  },
  { timestamps: false }
);

// Avoid re-compiling the model on hot-reload in Next.js dev
export const FormModel = models.Form ?? model<FormSchema>("Form", formSchema);
