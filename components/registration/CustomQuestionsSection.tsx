"use client";

import Dropdown from "@/components/ui/dropdown";

const inputBase =
  "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150";
const labelBase = "block text-sm text-zinc-400 mb-1.5";
const errorBase = "text-red-400 text-xs mt-1";

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

export default function CustomQuestionsSection({ sectionIndex, questions, answers, errors, onChange }: Props) {
  if (questions.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-[0.28em] text-zinc-600 mb-5">
        {`0${sectionIndex} — Additional Info`}
      </p>
      <div className="space-y-5">
        {questions.map((q) => (
          <div key={q.id}>
            <label className={labelBase}>
              {q.label}
              {q.required && <span className="text-primary ml-1">*</span>}
            </label>

            {q.type === "select" && q.options ? (
              <Dropdown
                options={q.options}
                value={answers[q.id] ?? ""}
                onChange={(val) => onChange(q.id, val)}
                placeholder="Select an option"
              />
            ) : q.type === "textarea" ? (
              <div className="relative">
                <textarea
                  rows={3}
                  className={`${inputBase} resize-none`}
                  placeholder="Your answer..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) => onChange(q.id, e.target.value)}
                />
                <span className="absolute bottom-2 right-3 text-[11px] font-mono text-zinc-700">
                  {(answers[q.id] ?? "").length} / 500
                </span>
              </div>
            ) : (
              <input
                className={inputBase}
                placeholder="Your answer..."
                value={answers[q.id] ?? ""}
                onChange={(e) => onChange(q.id, e.target.value)}
              />
            )}

            {errors[q.id] && <p className={errorBase}>{errors[q.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
