"use client";

// components/profile/ProfileSetupForm.tsx
// Shown when the user is authenticated but has no profiles row yet.
// Collects a username + display name and calls the createProfile server action.
// After success, reloads the page so the server component re-fetches the new row.

import { useState, useTransition } from "react";
import { Loader2, User, AtSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { createProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

export default function ProfileSetupForm({ email }: { email: string | undefined }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!username.trim()) { setError("Username is required."); return; }
    setError(null);

    startTransition(async () => {
      const result = await createProfile(username, fullName);
      if (result.success) {
        // Full page reload so the server component re-fetches the new profile row
        window.location.reload();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-glass-border bg-glass-bg/80 p-8 shadow-[0_30px_100px_-40px_rgba(255,122,0,0.3)] backdrop-blur-xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary">Welcome</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Set up your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re signed in as <span className="text-foreground font-medium">{email}</span>.
            Choose a username to complete your Heapify profile.
          </p>
        </div>

        {/* Username field */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Username <span className="text-primary">*</span>
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
            <AtSign className="h-4 w-4 text-zinc-600 shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              placeholder="stavan.dev"
              disabled={isPending}
              className="w-full bg-transparent text-base text-white placeholder:text-zinc-600 outline-none disabled:opacity-50"
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-600">Letters, numbers, _ . and - only. Minimum 3 characters.</p>
        </div>

        {/* Display name field */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Display name <span className="text-zinc-600 font-normal">(optional)</span>
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
            <User className="h-4 w-4 text-zinc-600 shrink-0" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Stavan Khobare"
              disabled={isPending}
              className="w-full bg-transparent text-base text-white placeholder:text-zinc-600 outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isPending || !username.trim()}
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating profile...</>
          ) : (
            <><CheckCircle2 className="mr-2 h-4 w-4" /> Create profile</>
          )}
        </Button>
      </div>
    </div>
  );
}
