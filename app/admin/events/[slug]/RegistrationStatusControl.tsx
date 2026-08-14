"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRegistrationStatus } from "@/lib/actions/events";
import { cn } from "@/lib/utils";
import type { RegistrationStatus } from "@/lib/types/database";

const statusOptions: { value: RegistrationStatus; label: string }[] = [
  { value: "registered", label: "Registered" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "attended", label: "Attended" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<string, string> = {
  registered: "text-blue-600 dark:text-blue-300",
  waitlisted: "text-amber-600 dark:text-amber-300",
  attended: "text-emerald-600 dark:text-emerald-300",
  cancelled: "text-red-600 dark:text-red-300",
};

export function RegistrationStatusControl({
  registrationId,
  status,
}: {
  registrationId: string;
  status: RegistrationStatus;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: RegistrationStatus) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateRegistrationStatus(registrationId, next);
      if (!result.success) {
        setMessage(result.error ?? "Unable to update status.");
      } else {
        setMessage("Saved");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => handleChange(event.target.value as RegistrationStatus)}
        disabled={isPending}
        className={cn(
          "rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs capitalize outline-none focus:border-primary disabled:opacity-60",
          statusStyles[status]
        )}
        aria-label="Registration status"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
