"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";

import { FormRenderer } from "@/components/FormRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormBuilderStore } from "@/hooks/use-form-builder-store";
import { getCurrentFormId, getForm } from "@/lib/storage";

export default function PreviewPage() {
  const { currentForm, setCurrentForm } = useFormBuilderStore();

  useEffect(() => {
    const existingId = getCurrentFormId();
    if (!existingId) {
      return;
    }

    const existingForm = getForm(existingId);
    if (existingForm) {
      setCurrentForm(existingForm);
    }
  }, [setCurrentForm]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <Badge>Preview</Badge>
          <CardTitle>Ready-to-publish form surface</CardTitle>
          <CardDescription>
            Validate the final experience before sharing. The public route is generated from the form id and a portable snapshot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Use this page to review spacing, question order, and validation behavior outside the editor context.</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/form/${currentForm.id}`}>
                Open public route
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/responses/${currentForm.id}`}>
                Inspect responses
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <FormRenderer form={currentForm} />
    </div>
  );
}