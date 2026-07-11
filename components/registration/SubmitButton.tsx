"use client";

import { Loader2, ArrowRight } from "lucide-react";

export type SubmitState = "idle" | "loading" | "success";

interface Props {
  state: SubmitState;
  onClick: () => void;
}

export default function SubmitButton({ state, onClick }: Props) {
  const isLoading = state === "loading";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={[
        "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold",
        "transition-all duration-150",
        isLoading
          ? "bg-primary/60 text-white cursor-wait"
          : "bg-primary text-white hover:bg-primary/90 active:scale-[0.99]",
      ].join(" ")}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          Submit registration
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
