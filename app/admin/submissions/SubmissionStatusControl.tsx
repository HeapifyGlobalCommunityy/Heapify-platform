"use client";

import { useState, useTransition } from "react";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/types/database";
import { updateSubmissionStatus } from "@/lib/actions/admin-applications";

export function SubmissionStatusControl({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: ApplicationStatus;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextStatus: ApplicationStatus) => {
    setStatus(nextStatus);
    setMessage(null);

    startTransition(async () => {
      const result = await updateSubmissionStatus(id, nextStatus);
      setMessage(result.success ? "Saved" : result.error ?? "Unable to save status.");
      if (!result.success) setStatus(initialStatus);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => handleChange(event.target.value as ApplicationStatus)}
        disabled={isPending}
        className="rounded-lg border border-glass-border bg-background px-3 py-2 text-xs capitalize text-foreground outline-none focus:border-primary disabled:opacity-60"
        aria-label="Submission status"
      >
        {APPLICATION_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {message && (
        <span className="text-xs text-muted-foreground" role="status">
          {isPending ? "Saving..." : message}
        </span>
      )}
    </div>
  );
}
