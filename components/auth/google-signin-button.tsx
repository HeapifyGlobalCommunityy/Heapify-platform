"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type GoogleSignInButtonProps = {
  mode?: "login" | "signup";
  captchaToken: string | null;
  onCaptchaReset: () => void;
};

export function GoogleSignInButton({
  mode = "login",
  captchaToken,
  onCaptchaReset,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase client is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const captchaResponse = await fetch("/api/captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: captchaToken }),
      });

      const captchaResult = (await captchaResponse.json()) as {
        success: boolean;
        message?: string;
      };

      if (!captchaResponse.ok || !captchaResult.success) {
        setError(captchaResult.message ?? "Captcha verification failed. Please try again.");
        onCaptchaReset();
        setIsLoading(false);
        return;
      }

      const nextParam = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback${nextParam}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        onCaptchaReset();
        setIsLoading(false);
        return;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error has occurred.");
      onCaptchaReset();
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="grid gap-3">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button 
        onClick={handleSignIn} 
        disabled={isLoading || !captchaToken}
        variant="ghost"
        className="w-full"
      >
        {isLoading ? (
          "Connecting..."
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {mode === "login" ? "Continue with Google" : "Sign up with Google"}
          </>
        )}
      </Button>
    </div>
  );
}
