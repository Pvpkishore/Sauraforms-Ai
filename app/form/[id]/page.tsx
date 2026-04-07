"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FormRenderer } from "@/components/FormRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeFormSnapshot } from "@/lib/storage";
import { getForm, saveForm } from "@/lib/storageAdapter";
import type { FormSchema } from "@/lib/types";

export default function PublicFormPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormSchema | null>(null);

  const snapshot = useMemo(() => searchParams.get("snapshot"), [searchParams]);

  useEffect(() => {
    const load = async () => {
      if (snapshot) {
        const decoded = decodeFormSnapshot(snapshot);
        if (decoded) {
          await saveForm(decoded);
          setForm(decoded);
          return;
        }
      }
      setForm(await getForm(params.id));
    };
    void load();
  }, [params.id, snapshot]);

  if (!form) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form not found</CardTitle>
          <CardDescription>This route needs either a local saved form or a copied snapshot in the URL.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <FormRenderer form={form} mode="public" />
    </div>
  );
}