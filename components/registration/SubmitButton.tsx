"use client";

import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

export type SubmitState = "idle" | "loading" | "success" | "error";

interface Props {
  state: SubmitState;
  errorMessage?: string | null;
  onClick: () => void;
}

export default function SubmitButton({ state, errorMessage, onClick }: Props) {
  const isLoading = state === "loading";
  const isError = state === "error";

  return (
    <div className="space-y-3">
      {isError && errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-3.5 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={[
          "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold",
          "transition-all duration-150",
          isLoading
            ? "bg-primary/60 text-white cursor-wait"
            : isError
            ? "bg-red-500/80 text-white hover:bg-red-500/90 active:scale-[0.99]"
            : "bg-primary text-white hover:bg-primary/90 active:scale-[0.99]",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : isError ? (
          <>
            <AlertCircle className="h-4 w-4" />
            Try again
          </>
        ) : (
          <>
            Submit registration
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
