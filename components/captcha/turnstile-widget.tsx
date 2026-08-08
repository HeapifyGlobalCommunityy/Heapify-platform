"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          action?: string;
          theme?: "auto" | "light" | "dark";
          appearance?: "always" | "execute" | "interaction-only";
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void;
  action?: string;
  theme?: "auto" | "light" | "dark";
};

export function TurnstileWidget({
  onTokenChange,
  action = "auth",
  theme = "auto",
}: TurnstileWidgetProps) {
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!isScriptReady || !siteKey || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    const widgetId = window.turnstile.render(`#${containerId}`, {
      sitekey: siteKey,
      action,
      theme,
      appearance: "always",
      callback: (token) => onTokenChange(token),
      "expired-callback": () => {
        onTokenChange(null);
        window.turnstile?.reset(widgetIdRef.current ?? undefined);
      },
      "error-callback": () => onTokenChange(null),
    });

    widgetIdRef.current = widgetId;

    return () => {
      onTokenChange(null);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, containerId, isScriptReady, onTokenChange, siteKey, theme]);

  if (!siteKey) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(true)}
      />
      <div id={containerId} className="min-h-[65px]" />
    </>
  );
}
