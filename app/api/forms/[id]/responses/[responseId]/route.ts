import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { ResponseModel } from "@/lib/models/response.model";
import type { FormResponseRecord } from "@/lib/types";

/** DELETE /api/forms/[id]/responses/[responseId] — delete a single response */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    await connectDB();
    await ResponseModel.deleteOne({ id: params.responseId, formId: params.id });

    // Return the remaining responses for the form so the client can sync state
    const remaining = await ResponseModel.find({ formId: params.id })
      .sort({ submittedAt: -1 })
      .lean<FormResponseRecord[]>();

    return NextResponse.json(remaining);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete response." },
      { status: 500 }
    );
  }
}
