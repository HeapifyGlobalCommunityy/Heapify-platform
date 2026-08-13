"use client";

import { useMemo, useState } from "react";
import type { ApplicationStatus } from "@/lib/types/database";
import { SubmissionStatusControl } from "./SubmissionStatusControl";

type Submission = {
  id: string;
  form_type: string;
  payload: unknown;
  status: string;
  created_at: string;
  submitted_by: string | null;
};

const STATUS_OPTIONS = ["all", "pending", "reviewed", "accepted", "rejected"];

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function formatPayloadValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

export function SubmissionFilters({ submissions }: { submissions: Submission[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");

  const formTypes = useMemo(
    () => [...new Set(submissions.map((submission) => submission.form_type))].sort(),
    [submissions]
  );

  const filteredSubmissions = submissions.filter(
    (submission) =>
      (statusFilter === "all" || submission.status === statusFilter) &&
      (formFilter === "all" || submission.form_type === formFilter)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass-bg p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-glass-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : formatLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
          Form type
          <select
            value={formFilter}
            onChange={(event) => setFormFilter(event.target.value)}
            className="rounded-lg border border-glass-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary"
          >
            <option value="all">All form types</option>
            {formTypes.map((formType) => (
              <option key={formType} value={formType}>
                {formatLabel(formType)}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-muted-foreground">
          Showing {filteredSubmissions.length} of {submissions.length}
        </p>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-8 text-center text-sm text-muted-foreground">
          No submissions match these filters.
        </div>
      ) : (
        filteredSubmissions.map((submission) => {
          const payload = submission.payload as Record<string, unknown>;

          return (
            <article
              key={submission.id}
              className="rounded-2xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-glass-border pb-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
                    {formatLabel(submission.form_type)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
                <SubmissionStatusControl
                  id={submission.id}
                  initialStatus={submission.status as ApplicationStatus}
                />
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {Object.entries(payload).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-glass-border/70 bg-background/30 p-3">
                    <dt className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      {formatLabel(key)}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                      {formatPayloadValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })
      )}
    </div>
  );
}
