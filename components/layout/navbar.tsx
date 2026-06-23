"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeapifyLogo } from "@/components/layout/logo";
import { navigationLinks } from "@/lib/site-content";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[94%] max-w-6xl -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full border border-glass-border bg-glass-bg dark:bg-black/50 px-5 py-3 shadow-[0_24px_80px_-40px_rgba(255,122,0,0.45)] backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2">
          <HeapifyLogo className="h-5 w-5" />
          <span className="font-display font-semibold text-sm tracking-tight">
            Heapify Global Community
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass-bg hover:bg-glass-border"
          >
            {mounted ? (theme === "dark" ? <Sun size={15} /> : <Moon size={15} />) : <div className="h-[15px] w-[15px]" />}
          </button>
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/forms/join">Join</Link>
          </Button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass-bg lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass-bg dark:bg-black/85 p-4 backdrop-blur-xl lg:hidden">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
