import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { ResponseModel } from "@/lib/models/response.model";
import type { FormResponseRecord } from "@/lib/types";

/** GET /api/forms/[id]/responses — list all responses for a form */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const responses = await ResponseModel.find({ formId: params.id })
      .sort({ submittedAt: -1 })
      .lean<FormResponseRecord[]>();
    return NextResponse.json(responses);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch responses." },
      { status: 500 }
    );
  }
}

/** POST /api/forms/[id]/responses — save a new response */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as FormResponseRecord;
    if (!body.id || !body.values) {
      return NextResponse.json({ error: "id and values are required." }, { status: 400 });
    }

    await connectDB();
    const response = await ResponseModel.create({
      ...body,
      formId: params.id
    });

    return NextResponse.json(response.toJSON(), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save response." },
      { status: 500 }
    );
  }
}

/** DELETE /api/forms/[id]/responses — clear all responses for a form */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await ResponseModel.deleteMany({ formId: params.id });
    return NextResponse.json({ cleared: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear responses." },
      { status: 500 }
    );
  }
}
