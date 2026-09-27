"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trophy, CalendarDays, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitChallengeEntry } from "@/lib/actions/challenges";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ChallengeData {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "past";
  start_at: string | null;
  end_at: string | null;
  winner: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Props {
  challenge: ChallengeData;
  isAuthenticated: boolean;
  initialSubmissionCount?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function StatusPill({ status }: { status: "active" | "past" }) {
  return (
    <span
      className={[
        "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        status === "active"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {status === "active" ? "Active" : "Past"}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ChallengeCard({ challenge, isAuthenticated, initialSubmissionCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [submissionCount, setSubmissionCount] = useState(initialSubmissionCount);

  type SubmitStatus = "idle" | "pending" | "success" | "error";
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(() => {
    if (isPending || submitStatus === "pending") return;
    setSubmitStatus("pending");
    setSubmitError(null);

    startTransition(async () => {
      const result = await submitChallengeEntry(challenge.id, url);
      if (result.success) {
        setSubmitStatus("success");
        setSubmissionCount((c) => c + 1);
        setUrl("");
        setTimeout(() => setSubmitStatus("idle"), 2500);
      } else {
        setSubmitStatus("error");
        setSubmitError(result.error);
      }
    });
  }, [isPending, submitStatus, challenge.id, url]);

  const isDisabled = isPending || submitStatus === "pending";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-colors"
    >
      {/* Card header */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Monthly Challenge
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
            {challenge.title}
          </h3>
        </div>
        <StatusPill status={challenge.status} />
      </div>

      {/* Description */}
      {challenge.description && (
        <p className="relative mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {challenge.description}
        </p>
      )}

      {/* Meta row */}
      <div className="relative mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <span>{formatDate(challenge.start_at)} – {formatDate(challenge.end_at)}</span>
        </div>
        {submissionCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            <span>{submissionCount} submission{submissionCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Winner badge */}
      {challenge.winner && (
        <div className="relative mt-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <Trophy className="h-3.5 w-3.5 shrink-0" />
          <span>Winner: <span className="font-semibold">@{challenge.winner.username}</span></span>
        </div>
      )}

      {/* Expand toggle + submission form */}
      <div className="relative mt-auto pt-5">
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setOpen((o) => !o)}
        >
          {challenge.status === "active" ? "Submit entry" : "View details"}
          <ChevronDown
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </Button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                {challenge.status === "active" ? (
                  isAuthenticated ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Submit a link to your entry — repo, deployed site, or doc.
                        Multiple submissions are allowed.
                      </p>

                      {/* Success state */}
                      {submitStatus === "success" && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Submitted! You can add another entry below.
                        </div>
                      )}

                      {/* Error state */}
                      {submitStatus === "error" && submitError && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {submitError}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            if (submitStatus === "error") setSubmitStatus("idle");
                          }}
                          placeholder="https://github.com/you/project"
                          disabled={isDisabled}
                          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary disabled:opacity-50 transition-colors"
                        />
                        <Button
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isDisabled || !url.trim()}
                          className="shrink-0"
                        >
                          {isDisabled ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Submit"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/40 p-4 text-center space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Sign in to submit an entry for this challenge.
                      </p>
                      <Button size="sm" asChild>
                        <a href={`/login?next=/challenges`}>Sign in to submit</a>
                      </Button>
                    </div>
                  )
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {challenge.description ?? "No additional details available for this challenge."}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
