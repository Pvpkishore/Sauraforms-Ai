"use client";

import { useMemo } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createEmptyField } from "@/lib/formParser";
import type { FieldType, FormField } from "@/lib/types";

interface DragDropBuilderProps {
  fields: FormField[];
  onAddField: (type: FieldType) => void;
  onUpdateField: (fieldId: string, patch: Partial<FormField>) => void;
  onRemoveField: (fieldId: string) => void;
  onReorder: (fields: FormField[]) => void;
}

function SortableField({ field, onUpdateField, onRemoveField }: Omit<DragDropBuilderProps, "fields" | "onAddField" | "onReorder"> & { field: FormField }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-3xl border border-white/10 bg-white/5 p-4"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-xl border border-white/10 p-2 text-muted-foreground" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
          <div>
            <p className="font-medium">{field.label}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{field.type}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemoveField(field.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input value={field.label} onChange={(event) => onUpdateField(field.id, { label: event.target.value })} placeholder="Field label" />
        <Input
          value={field.placeholder ?? ""}
          onChange={(event) => onUpdateField(field.id, { placeholder: event.target.value })}
          placeholder="Placeholder"
        />
        <Input
          value={field.description ?? ""}
          onChange={(event) => onUpdateField(field.id, { description: event.target.value })}
          placeholder="Description"
          className="md:col-span-2"
        />

        {field.type === "select" ? (
          <Input
            value={field.options?.map((option) => option.label).join(", ") ?? ""}
            onChange={(event) =>
              onUpdateField(field.id, {
                options: event.target.value
                  .split(",")
                  .map((entry) => entry.trim())
                  .filter(Boolean)
                  .map((entry) => ({ id: crypto.randomUUID(), label: entry, value: entry.toLowerCase().replace(/\s+/g, "-") }))
              })
            }
            placeholder="Options, separated by commas"
            className="md:col-span-2"
          />
        ) : null}

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm dark:bg-white/[0.03]">
          <input
            type="checkbox"
            checked={field.required ?? false}
            onChange={(event) => onUpdateField(field.id, { required: event.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          Required field
        </label>
      </div>
    </div>
  );
}

export function DragDropBuilder({ fields, onAddField, onUpdateField, onRemoveField, onReorder }: DragDropBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const fieldTypes = useMemo(
    () => ["text", "email", "number", "select", "checkbox", "file"] as FieldType[],
    []
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);
    onReorder(arrayMove(fields, oldIndex, newIndex));
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Field palette</CardTitle>
          <CardDescription>Add, edit, and reorder every question in the generated form.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {fieldTypes.map((type) => (
              <Button key={type} variant="secondary" className="justify-start" onClick={() => onAddField(type)}>
                <Plus className="h-4 w-4" />
                {createEmptyField(type).label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form structure</CardTitle>
          <CardDescription>Drag cards to reorder. Changes update the preview instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    onUpdateField={onUpdateField}
                    onRemoveField={onRemoveField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}