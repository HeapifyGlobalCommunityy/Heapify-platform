"use client";

export type SubmitState = "idle" | "loading" | "success" | "disabled";

interface Props {
  state: SubmitState;
  onClick: () => void;
}

export default function SubmitButton({ state, onClick }: Props) {
  const isDisabled = state === "loading" || state === "success" || state === "disabled";

  const label =
    state === "loading"
      ? "Registering..."
      : state === "success"
      ? "You're in ✓"
      : "Confirm Registration";

  return (
    <div className="flex flex-col items-stretch lg:items-end gap-3">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          relative font-display font-medium text-sm px-8 py-3 rounded-lg
          transition-all duration-200 w-full lg:w-auto
          ${state === "disabled"
            ? "bg-primary/40 text-black/50 cursor-not-allowed"
            : state === "success"
            ? "bg-primary text-black scale-105"
            : "bg-primary text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,122,0,0.3)] active:scale-[0.98]"
          }
          ${state === "loading" ? "cursor-wait" : ""}
        `}
      >
        {state === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
            </svg>
            Registering...
          </span>
        ) : (
          label
        )}
      </button>
      <p className="text-xs text-zinc-600 text-center lg:text-right">
        By registering, you agree to our community guidelines.
      </p>
    </div>
  );
}
