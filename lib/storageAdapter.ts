/**
 * storageAdapter.ts
 *
 * Unified async storage interface used by all pages and components.
 *
 * When NEXT_PUBLIC_USE_MONGODB=true  → calls the REST API routes backed by MongoDB
 * When NEXT_PUBLIC_USE_MONGODB≠true → wraps the synchronous localStorage functions
 *
 * UI state (currentFormId) and utilities (downloadTextFile, exportFormSnapshot,
 * decodeFormSnapshot, subscribeToStorageChanges) are always imported directly
 * from lib/storage because they are browser-only or framework utilities.
 */

import * as localStorage from "@/lib/storage";
import type { FormResponseRecord, FormSchema } from "@/lib/types";

const USE_MONGODB = process.env.NEXT_PUBLIC_USE_MONGODB === "true";

// ─── helpers ─────────────────────────────────────────────────────────────────

function isBrowser() {
  return typeof window !== "undefined";
}

/** Remove mongoose __v and _id fields that leak into JSON responses */
function stripMeta<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const copy = { ...(obj as Record<string, unknown>) };
  delete copy.__v;
  delete copy._id;
  return copy as T;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `API error ${res.status}`);
  }
  const data = await res.json() as T;
  if (Array.isArray(data)) {
    return data.map((item) => stripMeta(item)) as T;
  }
  return stripMeta(data);
}

// ─── forms ───────────────────────────────────────────────────────────────────

export async function getForms(): Promise<FormSchema[]> {
  if (!USE_MONGODB || !isBrowser()) {
    return localStorage.getForms();
  }
  try {
    return await apiFetch<FormSchema[]>("/api/forms");
  } catch {
    return localStorage.getForms();
  }
}

export async function getForm(formId: string): Promise<FormSchema | null> {
  if (!USE_MONGODB || !isBrowser()) {
    return localStorage.getForm(formId);
  }
  try {
    return await apiFetch<FormSchema>(`/api/forms/${formId}`);
  } catch {
    // Fallback to localStorage cache (e.g. snapshot was saved locally)
    return localStorage.getForm(formId);
  }
}

export async function saveForm(form: FormSchema): Promise<void> {
  if (!USE_MONGODB || !isBrowser()) {
    localStorage.saveForm(form);
    return;
  }
  try {
    await apiFetch<FormSchema>("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    // Keep localStorage in sync as a local cache
    localStorage.saveForm(form);
  } catch {
    // Degrade gracefully — at least persist locally
    localStorage.saveForm(form);
  }
}

export async function deleteForm(formId: string): Promise<void> {
  if (!USE_MONGODB || !isBrowser()) {
    localStorage.deleteForm(formId);
    return;
  }
  try {
    await apiFetch(`/api/forms/${formId}`, { method: "DELETE" });
  } finally {
    localStorage.deleteForm(formId);
  }
}

// ─── responses ───────────────────────────────────────────────────────────────

export async function getResponses(formId: string): Promise<FormResponseRecord[]> {
  if (!USE_MONGODB || !isBrowser()) {
    return localStorage.getResponses(formId);
  }
  try {
    return await apiFetch<FormResponseRecord[]>(`/api/forms/${formId}/responses`);
  } catch {
    return localStorage.getResponses(formId);
  }
}

export async function saveResponse(
  formId: string,
  response: FormResponseRecord
): Promise<FormResponseRecord[]> {
  if (!USE_MONGODB || !isBrowser()) {
    return localStorage.saveResponse(formId, response);
  }
  try {
    await apiFetch<FormResponseRecord>(`/api/forms/${formId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
    });
    // Also cache locally so the same session doesn't need a round-trip
    localStorage.saveResponse(formId, response);
    return await getResponses(formId);
  } catch {
    return localStorage.saveResponse(formId, response);
  }
}

export async function deleteResponse(
  formId: string,
  responseId: string
): Promise<FormResponseRecord[]> {
  if (!USE_MONGODB || !isBrowser()) {
    return localStorage.deleteResponse(formId, responseId);
  }
  try {
    const remaining = await apiFetch<FormResponseRecord[]>(
      `/api/forms/${formId}/responses/${responseId}`,
      { method: "DELETE" }
    );
    localStorage.deleteResponse(formId, responseId);
    return remaining;
  } catch {
    return localStorage.deleteResponse(formId, responseId);
  }
}

export async function clearResponses(formId: string): Promise<FormResponseRecord[]> {
  if (!USE_MONGODB || !isBrowser()) {
    return localStorage.clearResponses(formId);
  }
  try {
    await apiFetch(`/api/forms/${formId}/responses`, { method: "DELETE" });
    localStorage.clearResponses(formId);
    return [];
  } catch {
    return localStorage.clearResponses(formId);
  }
}

// ─── Re-export UI state + utilities (always localStorage / browser) ──────────

export const getCurrentFormId = localStorage.getCurrentFormId;
export const setCurrentFormId = localStorage.setCurrentFormId;
export const subscribeToStorageChanges = localStorage.subscribeToStorageChanges;
export const exportFormSnapshot = localStorage.exportFormSnapshot;
export const decodeFormSnapshot = localStorage.decodeFormSnapshot;
export const downloadTextFile = localStorage.downloadTextFile;
