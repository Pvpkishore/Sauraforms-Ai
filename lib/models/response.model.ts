import { Schema, model, models } from "mongoose";

import type { FormResponseRecord, FormResponseValue } from "@/lib/types";

const responseSchema = new Schema<FormResponseRecord>(
  {
    id: { type: String, required: true, index: true },
    formId: { type: String, required: true, index: true },
    submittedAt: { type: String, required: true },
    values: {
      type: Schema.Types.Mixed,
      required: true,
      default: {}
    }
  },
  { timestamps: false }
);

responseSchema.index({ formId: 1, submittedAt: -1 });

// Avoid re-compiling the model on hot-reload in Next.js dev
export const ResponseModel = models.Response ?? model<FormResponseRecord>("Response", responseSchema);
