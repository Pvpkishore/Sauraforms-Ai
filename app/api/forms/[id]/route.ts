import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { FormModel } from "@/lib/models/form.model";
import type { FormSchema } from "@/lib/types";

/** GET /api/forms/[id] — get a single form */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const form = await FormModel.findOne({ id: params.id }).lean<FormSchema>();
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }
    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch form." },
      { status: 500 }
    );
  }
}

/** PUT /api/forms/[id] — update a form */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Partial<FormSchema>;
    await connectDB();

    const form = await FormModel.findOneAndUpdate(
      { id: params.id },
      { ...body, updatedAt: new Date().toISOString() },
      { new: true, lean: true }
    );

    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update form." },
      { status: 500 }
    );
  }
}

/** DELETE /api/forms/[id] — delete a form */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await FormModel.deleteOne({ id: params.id });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete form." },
      { status: 500 }
    );
  }
}
