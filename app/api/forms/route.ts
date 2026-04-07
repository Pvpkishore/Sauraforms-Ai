import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { FormModel } from "@/lib/models/form.model";
import type { FormSchema } from "@/lib/types";

/** GET /api/forms — list all forms */
export async function GET() {
  try {
    await connectDB();
    const forms = await FormModel.find({}).lean<FormSchema[]>();
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch forms." },
      { status: 500 }
    );
  }
}

/** POST /api/forms — create or upsert a form */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FormSchema;
    if (!body.id || !body.title) {
      return NextResponse.json({ error: "id and title are required." }, { status: 400 });
    }

    await connectDB();

    const form = await FormModel.findOneAndUpdate(
      { id: body.id },
      { ...body, updatedAt: new Date().toISOString() },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save form." },
      { status: 500 }
    );
  }
}
