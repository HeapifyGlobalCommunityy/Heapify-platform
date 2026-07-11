"use client";

import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
        return;
      }

      if (action === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
            data : {
              full_name: fullName,
            },
          },
        });
        
        if (signUpError) {
          setError(signUpError.message);
          onCaptchaReset();
        } else {
          setMessage("Check your email to confirm your account.");
          onCaptchaReset();
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          setError(signInError.message);
          onCaptchaReset();
        } else {
          // If successful, redirect to dashboard or desired next page
          window.location.href = "/dashboard";
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error has occured");
      onCaptchaReset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
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
        <Label htmlFor="password">Password</Label>
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
            !captchaToken ||
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
