"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EmailSignInFormProps = {
  mode?: "login" | "signup";
  captchaToken: string | null;
  onCaptchaReset: () => void;
};

export function EmailSignInForm({
  mode = "login",
  captchaToken,
  onCaptchaReset,
}: EmailSignInFormProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const handleAuth = async (action: "login" | "signup") => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (!supabase) {
      setError("Supabase client is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      // Perform Turnstile captcha verification if configured and token is provided
      if (process.env.NODE_ENV !== "development" && siteKey && captchaToken) {
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
        } catch (captchaErr) {
          console.warn("[EmailSignInForm] Captcha check failed:", captchaErr);
        }
      }

      if (isForgotPassword) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        });

        if (resetError) {
          setError(resetError.message);
          onCaptchaReset();
        } else {
          setMessage("Password reset link sent to your email.");
          onCaptchaReset();
        }
      } else if (action === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          console.error("Signup error (not shown to user):", signUpError.message);
          setError("If this email isn't already registered, check your inbox to confirm your account.");
          onCaptchaReset();
        } else {
          setMessage("If this email isn't already registered, check your inbox to confirm your account.");
          onCaptchaReset();
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError("Invalid email or password.");
          onCaptchaReset();
        } else {
          window.location.href = redirectTo || "/dashboard";
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error has occurred");
      onCaptchaReset();
    } finally {
      setIsLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="grid gap-4" suppressHydrationWarning={true}>
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500">
            {message}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <Button
            onClick={() => handleAuth(mode)}
            disabled={isLoading || !email || (siteKey ? !captchaToken : false)}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError(null);
                setMessage(null);
              }}
              className="underline hover:text-foreground"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4" suppressHydrationWarning={true}>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500">
          {message}
        </div>
      )}

      {mode === "signup" && (
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(true);
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div className="flex flex-col gap-4 mt-2">
        <Button
          onClick={() => handleAuth(mode)}
          disabled={
            isLoading ||
            !email ||
            !password ||
            (process.env.NODE_ENV !== "development" && siteKey ? !captchaToken : false) ||
            (mode === "signup" && !fullName)
          }
          className="w-full"
        >
          {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <a href="/signup" className="underline hover:text-foreground">
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a href="/login" className="underline hover:text-foreground">
                Sign in
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
