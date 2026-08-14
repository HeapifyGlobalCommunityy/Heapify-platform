"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, Trash2 } from "lucide-react";
import { adminCancelEvent, adminDeleteEvent } from "@/lib/actions/events";
import type { EventStatus } from "@/lib/types/database";

export function EventManagementActions({
  eventId,
  title,
  status,
  registrationCount,
}: {
  eventId: string;
  title: string;
  status: EventStatus;
  registrationCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isCancelled = status === "cancelled";
  const canDelete = registrationCount === 0;

  function cancelEvent() {
    if (!window.confirm(`Cancel "${title}"? Attendees will no longer be able to register.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await adminCancelEvent(eventId);
      if (!result.success) {
        setError(result.error ?? "Unable to cancel event.");
      } else {
        router.refresh();
      }
    });
  }

  function deleteEvent() {
    if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteEvent(eventId);
      if (!result.success) {
        setError(result.error ?? "Unable to delete event.");
      } else {
        router.push("/admin/events");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {!isCancelled && (
          <button
            type="button"
            onClick={cancelEvent}
            disabled={isPending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            Cancel
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={deleteEvent}
            disabled={isPending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        )}
      </div>
      {error && (
        <p className="max-w-64 text-right text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
