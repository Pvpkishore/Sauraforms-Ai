export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "file";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
}

export interface FormSchema {
  id: string;
  title: string;
  description: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
}

export type FormResponseValue = string | number | boolean | string[];

export interface FormResponseRecord {
  id: string;
  formId: string;
  submittedAt: string;
  values: Record<string, FormResponseValue>;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  prompt: string;
}