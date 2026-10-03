"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service or console
    console.error("Heapify Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-inner">
          <AlertTriangle className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <span className="eyebrow text-primary/80">Application Error</span>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Something went sideways
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this page. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-muted-foreground/70 bg-muted/50 py-1 px-2 rounded-md inline-block">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-border/80 bg-card text-foreground text-sm font-medium hover:bg-muted/50 transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
