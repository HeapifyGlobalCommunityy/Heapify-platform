"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { reviewChapterMembership, type ChapterMembershipRequest } from "@/lib/actions/chapter-membership";
import { Button } from "@/components/ui/button";

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "");
}

export function ChapterMembershipRequests({
  requests,
}: {
  requests: ChapterMembershipRequest[];
}) {
  const [isPending, startTransition] = useTransition();

  function review(id: string, decision: "accepted" | "rejected") {
    startTransition(async () => {
      await reviewChapterMembership(id, decision);
      window.location.reload();
    });
  }

  return (
    <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Membership</p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">Join Requests</h3>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          {requests.length} pending
        </span>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-glass-border bg-glass-bg/40 p-5 text-sm text-muted-foreground">
          No pending membership requests.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-glass-border bg-glass-bg/40 p-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {displayValue(request.payload.name) || "Unnamed applicant"}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {displayValue(request.payload.email)}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                    {displayValue(request.payload.why_join)}
                  </p>
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Submitted {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={() => review(request.id, "accepted")}
                    className="gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => review(request.id, "rejected")}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
