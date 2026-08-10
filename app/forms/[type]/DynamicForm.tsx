"use client";

// app/forms/[type]/DynamicForm.tsx
// Config-driven form client component.
// - Renders fields from the config (text, email, number, textarea, select, multi_select).
// - Client-side required field highlighting (independent of server validation).
// - submit button disabled while in-flight to prevent duplicate submissions.
// - Shows a success confirmation or an error banner based on server action result.

import { useState, useTransition } from "react";
import { submitForm } from "@/lib/actions/forms";
import type { FormConfig } from "./page";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  formType: string;
  config: FormConfig;
}

export default function DynamicForm({ formType, config }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string | string[]>>(() => {
    const init: Record<string, string | string[]> = {};
    for (const field of config.fields) {
      init[field.name] = field.type === "multi_select" ? [] : "";
    }
    return init;
  });

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleMultiChange(name: string, option: string) {
    setValues((prev) => {
      const current = (prev[name] as string[]) ?? [];
      const updated = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [name]: updated };
    });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await submitForm(formType, values as Record<string, unknown>);
      if (result.success) {
        setSubmitted(true);
      } else {
        setGlobalError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  }

  // ── Success confirmation ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-[1.75rem] border border-primary/30 bg-primary/5 p-10 text-center space-y-4 animate-fade-in">
        <CheckCircle className="mx-auto h-10 w-10 text-primary" />
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Submission Received
        </h2>
        <p className="text-sm text-muted-foreground leading-7 max-w-md mx-auto">
          Your <span className="text-foreground font-medium capitalize">{formType.replace(/_/g, " ")}</span> submission
          is currently pending review. We will reach out to you shortly — keep
          an eye on your inbox.
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      {/* Global error banner */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {config.fields.map((field) => {
        const error = fieldErrors[field.name];
        const baseInputClass = cn(
          "w-full rounded-xl border bg-glass-bg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors backdrop-blur-sm",
          "focus:ring-2 focus:ring-primary/40",
          error ? "border-red-500/60" : "border-glass-border focus:border-primary/60"
        );

        return (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && (
                <span className="ml-1 text-primary" aria-hidden>*</span>
              )}
            </label>

            {/* text / email / number */}
            {(field.type === "text" ||
              field.type === "email" ||
              field.type === "number") && (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={values[field.name] as string}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className={baseInputClass}
              />
            )}

            {/* textarea */}
            {field.type === "textarea" && (
              <textarea
                id={field.name}
                name={field.name}
                value={values[field.name] as string}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className={cn(baseInputClass, "resize-none")}
              />
            )}

            {/* single-select dropdown */}
            {field.type === "select" && (
              <select
                id={field.name}
                name={field.name}
                value={values[field.name] as string}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={cn(baseInputClass, "cursor-pointer")}
              >
                <option value="" disabled className="bg-background text-foreground">
                  — Select one —
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt.toLowerCase().replace(/\s+/g, "_")} className="bg-background text-foreground">
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* multi-select checkbox group */}
            {field.type === "multi_select" && (
              <div
                className={cn(
                  "rounded-xl border p-4 space-y-2",
                  error ? "border-red-500/60" : "border-glass-border"
                )}
              >
                <p className="text-xs text-muted-foreground mb-3">
                  Select all that apply
                </p>
                {field.options?.map((opt) => {
                  const val = opt.toLowerCase().replace(/\s+/g, "_");
                  const checked = (values[field.name] as string[]).includes(val);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "h-4 w-4 shrink-0 rounded border transition-colors",
                          checked
                            ? "bg-primary border-primary"
                            : "bg-transparent border-glass-border group-hover:border-primary/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => handleMultiChange(field.name, val)}
                        />
                        {checked && (
                          <svg
                            className="h-full w-full text-black"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path d="M13.485 3.515a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06L6 9.94l6.424-6.425a.75.75 0 011.06 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Inline field error */}
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2"
        size="lg"
      >
        {isPending ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
