"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeapifyLogo } from "@/components/layout/logo";
import { navigationLinks } from "@/lib/site-content";
import { useAuth } from "@/components/auth/AuthProvider";

export function Navbar({ isChapterLead = false }: { isChapterLead?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();
  const user = auth.user;
  const profile = auth.profile;
  const [canCreateEvents, setCanCreateEvents] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const router = useRouter();

  const isProd = process.env.NEXT_PUBLIC_STAGE === "production" || process.env.NODE_ENV === "production";

  const filteredLinks = navigationLinks.filter((link) => {
    if (isProd) {
      return !["/challenges", "/open-source", "/resources"].includes(link.href);
    }
    return true;
  });

  // Hide on scroll down, reveal on scroll up
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      // Always show when near the top
      if (currentY < 80) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        // Scrolling down — hide
        setVisible(false);
        setOpen(false); // close mobile menu if open
      } else if (currentY < lastScrollY.current - 4) {
        // Scrolling up — show
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (profile && (['admin', 'community_admin', 'chapter_lead'].includes(profile.role) || isChapterLead)) {
      setCanCreateEvents(true);
    } else {
      setCanCreateEvents(false);
    }
  }, [profile, isChapterLead]);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await auth.signOut();
      setOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setSignOutError("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav
      className="fixed top-4 left-1/2 z-50 w-[94%] max-w-7xl -translate-x-1/2 transition-all duration-300 ease-in-out"
      suppressHydrationWarning={true}
      style={{
        transform: `translateX(-50%) translateY(${visible ? "0" : "-130%"})`,
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center justify-between gap-4 xl:gap-6 rounded-full border border-glass-border bg-glass-bg dark:bg-black/50 px-5 py-3 shadow-[0_24px_80px_-40px_rgba(255,122,0,0.45)] backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <HeapifyLogo className="h-5 w-5" />
          <span className="font-display font-semibold text-sm tracking-tight whitespace-nowrap">
            Heapify <span className="hidden xl:inline">Global Community</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 xl:gap-6 text-sm text-muted-foreground lg:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          {isChapterLead && (
            <Link href="/chapter" className="transition-colors hover:text-foreground">
              Chapter
            </Link>
          )}
          {filteredLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass-bg hover:bg-glass-border"
          >
            {mounted ? (theme === "dark" ? <Sun size={15} /> : <Moon size={15} />) : <div className="h-[15px] w-[15px]" />}
          </button>

          {mounted && user ? (
            <>
              {canCreateEvents && (
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-primary font-semibold hover:text-primary" asChild>
                  <Link href="/chapter/events/new">+ Event</Link>
                </Button>
              )}
              {!isProd && (
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/signup">Join</Link>
              </Button>
            </>
          )}

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-glass-bg lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {signOutError && (
        <p
          role="alert"
          className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-400"
        >
          {signOutError}
        </p>
      )}

      {open && (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass-bg dark:bg-black/85 p-4 backdrop-blur-xl lg:hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          {isChapterLead && (
            <Link
              href="/chapter"
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Chapter
            </Link>
          )}
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {mounted && user ? (
            <>
              {!isProd && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-busy={isSigningOut}
                className="text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Join
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
