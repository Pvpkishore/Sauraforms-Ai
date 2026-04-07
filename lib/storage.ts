import type { FormResponseRecord, FormSchema } from "@/lib/types";

const STORAGE_KEYS = {
  forms: "ai-form-builder:forms",
  responses: "ai-form-builder:responses",
  currentFormId: "ai-form-builder:current-form-id"
} as const;

const STORAGE_CHANGE_EVENT = "ai-form-builder:storage-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
}

export function getForms() {
  return readJson<FormSchema[]>(STORAGE_KEYS.forms, []);
}

export function getForm(formId: string) {
  return getForms().find((form) => form.id === formId) ?? null;
}

export function saveForm(form: FormSchema) {
  const existing = getForms();
  const next = [...existing.filter((entry) => entry.id !== form.id), { ...form, updatedAt: new Date().toISOString() }];
  writeJson(STORAGE_KEYS.forms, next);
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEYS.currentFormId, form.id);
  }
  return next;
}

export function deleteForm(formId: string) {
  const next = getForms().filter((form) => form.id !== formId);
  writeJson(STORAGE_KEYS.forms, next);
  return next;
}

export function duplicateForm(form: FormSchema) {
  const duplicated: FormSchema = {
    ...form,
    id: `${form.id}-copy-${crypto.randomUUID().slice(0, 4)}`,
    title: `${form.title} Copy`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveForm(duplicated);
  return duplicated;
}

export function getCurrentFormId() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.currentFormId);
}

export function setCurrentFormId(formId: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.currentFormId, formId);
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
}

export function subscribeToStorageChanges(onChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => onChange();
  window.addEventListener(STORAGE_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getResponsesMap() {
  return readJson<Record<string, FormResponseRecord[]>>(STORAGE_KEYS.responses, {});
}

export function getResponses(formId: string) {
  return getResponsesMap()[formId] ?? [];
}

export function saveResponse(formId: string, response: FormResponseRecord) {
  const responseMap = getResponsesMap();
  responseMap[formId] = [...(responseMap[formId] ?? []), response];
  writeJson(STORAGE_KEYS.responses, responseMap);
  return responseMap[formId];
}

export function deleteResponse(formId: string, responseId: string) {
  const responseMap = getResponsesMap();
  const next = (responseMap[formId] ?? []).filter((response) => response.id !== responseId);
  responseMap[formId] = next;
  writeJson(STORAGE_KEYS.responses, responseMap);
  return next;
}

export function clearResponses(formId: string) {
  const responseMap = getResponsesMap();
  responseMap[formId] = [];
  writeJson(STORAGE_KEYS.responses, responseMap);
  return responseMap[formId];
}

export function exportFormSnapshot(form: FormSchema) {
  if (!isBrowser()) {
    return "";
  }

  return window.btoa(unescape(encodeURIComponent(JSON.stringify(form))));
}

export function decodeFormSnapshot(snapshot: string) {
  try {
    if (!isBrowser()) {
      return null;
    }

    const json = decodeURIComponent(escape(window.atob(snapshot)));
    return JSON.parse(json) as FormSchema;
  } catch {
    return null;
  }
}

export function downloadTextFile(filename: string, content: string, type = "application/json") {
  if (!isBrowser()) {
    return;
  }

  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}