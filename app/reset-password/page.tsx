"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeapifyLogo } from "@/components/layout/logo";
import { AnimatedNetworkBackground } from "@/components/site/background";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase client is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden px-6 py-24 bg-background">
      <AnimatedNetworkBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="flex flex-col items-center space-y-4 text-center mb-8">
          <HeapifyLogo className="h-12 w-12 shadow-[0_8px_30px_rgb(255,122,0,0.3)]" />
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(135deg,rgba(255,122,0,0.06),rgba(255,255,255,0.02),rgba(10,10,10,0.7))] p-8 shadow-[0_40px_120px_-60px_rgba(255,122,0,0.35)] backdrop-blur-2xl">
          {success ? (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500 text-center">
              Password updated successfully! Redirecting to dashboard...
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="grid gap-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full mt-2"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
