"use client";

import { AlertCircle, ChevronDown } from "lucide-react";

export interface CustomQuestion {
  id: string;
  label: string;
  type: "select" | "text" | "textarea";
  options?: string[];
  required: boolean;
}

interface Props {
  sectionIndex: number;
  questions: CustomQuestion[];
  answers: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

export default function CustomQuestionsSection({ questions, answers, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const value = answers[q.id] ?? "";
        const error = errors[q.id];

        return (
          <div key={q.id}>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              {q.label}
              {q.required && <span className="text-primary ml-1">*</span>}
            </label>

            {q.type === "select" && (
              <div className="relative">
                <select
                  value={value}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className={[
                    "w-full appearance-none rounded-xl border bg-zinc-950/60 px-3.5 py-2.5 text-sm text-white",
                    "outline-none transition-colors cursor-pointer",
                    error ? "border-red-500/50" : "border-zinc-800 focus:border-primary/60",
                    value === "" ? "text-zinc-600" : "text-white",
                  ].join(" ")}
                >
                  <option value="" disabled>Select an option</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt} className="bg-zinc-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
              </div>
            )}

            {q.type === "text" && (
              <div
                className={[
                  "rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
                  error ? "border-red-500/50" : "border-zinc-800 focus-within:border-primary/60",
                ].join(" ")}
              >
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                />
              </div>
            )}

            {q.type === "textarea" && (
              <div
                className={[
                  "rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
                  error ? "border-red-500/50" : "border-zinc-800 focus-within:border-primary/60",
                ].join(" ")}
              >
                <textarea
                  value={value}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none resize-none"
                />
              </div>
            )}

            {error && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
