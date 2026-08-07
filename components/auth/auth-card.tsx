"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { brand } from "@/lib/site-content";
import { HeapifyLogo } from "@/components/layout/logo";
import { AnimatedNetworkBackground } from "@/components/site/background";
import { TurnstileWidget } from "@/components/captcha/turnstile-widget";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { EmailSignInForm } from "@/components/auth/email-signin-form";

export function AuthCard({ mode = "login" }: { mode?: "login" | "signup" }) {
  const isLogin = mode === "login";
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaWidgetKey, setCaptchaWidgetKey] = useState(0);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaWidgetKey((current) => current + 1);
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* Premium network background animation */}
      <AnimatedNetworkBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Logo and title */}
        <div className="flex flex-col items-center space-y-4 text-center mb-8">
          <HeapifyLogo className="h-12 w-12 shadow-[0_8px_30px_rgb(255,122,0,0.3)]" />
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? `Sign in to your ${brand.name} dashboard`
                : `Join ${brand.name} global developer network`}
            </p>
          </div>
        </div>

        {/* Auth form card with premium glassmorphism */}
        <div className="rounded-[2rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(135deg,rgba(255,122,0,0.06),rgba(255,255,255,0.02),rgba(10,10,10,0.7))] p-8 shadow-[0_40px_120px_-60px_rgba(255,122,0,0.35)] backdrop-blur-2xl">
          <div className="grid gap-5">
            <GoogleSignInButton
              mode={mode}
              captchaToken={captchaToken}
              onCaptchaReset={resetCaptcha}
            />

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Captcha</span>
                <span className="text-xs text-muted-foreground">
                  Required for Google and email sign-in
                </span>
              </div>
              <TurnstileWidget
                key={captchaWidgetKey}
                action={mode === "login" ? "login" : "signup"}
                onTokenChange={setCaptchaToken}
              />
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-glass-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-glass-bg px-3 py-1 rounded-full border border-glass-border/30 text-[10px] tracking-wider text-muted-foreground backdrop-blur-sm">
                  Or continue with email
                </span>
              </div>
            </div>

            <EmailSignInForm
              mode={mode}
              captchaToken={captchaToken}
              onCaptchaReset={resetCaptcha}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
