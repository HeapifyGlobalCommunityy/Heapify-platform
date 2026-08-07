"use client";

import { AlertCircle, CheckSquare, Square, Circle, CircleDot } from "lucide-react";

export type QuestionType = "short_text" | "long_text" | "single_choice" | "multiple_choice" | "number";

export interface CustomQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

interface Props {
  sectionIndex: number;
  questions: CustomQuestion[];
  answers: Record<string, string | string[]>;
  errors: Record<string, string>;
  onChange: (id: string, value: string | string[]) => void;
}

export default function CustomQuestionsSection({ questions, answers, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      {questions.map((q) => {
        // Fallback for legacy data where type might be missing
        const qType = q.type || "short_text";
        const val = answers[q.id];
        const error = errors[q.id];

        // Ensure multiple_choice value is always an array
        const multiVal: string[] = Array.isArray(val) ? val : [];
        const singleVal: string = typeof val === "string" ? val : "";

        const handleMultiToggle = (option: string) => {
          if (multiVal.includes(option)) {
            onChange(q.id, multiVal.filter((v) => v !== option));
          } else {
            onChange(q.id, [...multiVal, option]);
          }
        };

        return (
          <div key={q.id}>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              {q.label}
              {q.required && <span className="text-primary ml-1">*</span>}
            </label>

            {qType === "short_text" && (
              <div
                className={[
                  "rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
                  error ? "border-red-500/50" : "border-zinc-800 focus-within:border-primary/60",
                ].join(" ")}
              >
                <input
                  type="text"
                  value={singleVal}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                />
              </div>
            )}

            {qType === "long_text" && (
              <div
                className={[
                  "rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
                  error ? "border-red-500/50" : "border-zinc-800 focus-within:border-primary/60",
                ].join(" ")}
              >
                <textarea
                  value={singleVal}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none resize-none"
                />
              </div>
            )}

            {qType === "number" && (
              <div
                className={[
                  "rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
                  error ? "border-red-500/50" : "border-zinc-800 focus-within:border-primary/60",
                ].join(" ")}
              >
                <input
                  type="number"
                  step="any"
                  value={singleVal}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                />
              </div>
            )}

            {qType === "single_choice" && (
              <div className="space-y-2">
                {(!q.options || q.options.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-center">
                    <p className="text-xs text-zinc-500">This question has no options configured.</p>
                  </div>
                ) : (
                  q.options.map((opt) => (
                    <label
                      key={opt}
                      className={[
                        "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors",
                        singleVal === opt
                          ? "border-primary/50 bg-primary/10"
                          : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60",
                        error && singleVal !== opt && "border-red-500/50"
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={opt}
                        checked={singleVal === opt}
                        onChange={() => onChange(q.id, opt)}
                        className="sr-only"
                      />
                      {singleVal === opt ? (
                        <CircleDot className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-zinc-600 shrink-0" />
                      )}
                      <span className="text-sm text-white">{opt}</span>
                    </label>
                  ))
                )}
              </div>
            )}

            {qType === "multiple_choice" && (
              <div className="space-y-2">
                {(!q.options || q.options.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-center">
                    <p className="text-xs text-zinc-500">This question has no options configured.</p>
                  </div>
                ) : (
                  q.options.map((opt) => {
                    const isChecked = multiVal.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={[
                          "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors",
                          isChecked
                            ? "border-primary/50 bg-primary/10"
                            : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60",
                          error && !isChecked && multiVal.length === 0 && "border-red-500/50"
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleMultiToggle(opt)}
                          className="sr-only"
                        />
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-zinc-600 shrink-0" />
                        )}
                        <span className="text-sm text-white">{opt}</span>
                      </label>
                    );
                  })
                )}
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
