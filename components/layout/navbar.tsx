"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeapifyLogo } from "@/components/layout/logo";
import { navigationLinks } from "@/lib/site-content";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar({ isChapterLead = false }: { isChapterLead?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const auth = useAuth();
  const user = auth.user;
  const profile = auth.profile;
  const [canCreateEvents, setCanCreateEvents] = useState(false);

  const isProd =
    process.env.NEXT_PUBLIC_STAGE === "production" ||
    process.env.NODE_ENV === "production";

  const filteredLinks = navigationLinks.filter((link) => {
    if (isProd) {
      return !["/challenges", "/open-source", "/resources"].includes(link.href);
    }
    return true;
  });

  const allNavLinks = [
    { href: "/", label: "Home" },
    ...(isChapterLead ? [{ href: "/chapter", label: "Chapter" }] : []),
    ...filteredLinks,
  ];

  useEffect(() => {
    setMounted(true);
    if (
      profile &&
      (["admin", "community_admin", "chapter_lead"].includes(profile.role) ||
        isChapterLead)
    ) {
      setCanCreateEvents(true);
    } else {
      setCanCreateEvents(false);
    }
  }, [profile, isChapterLead]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);
      if (currentY < 80) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setVisible(false);
        setOpen(false);
      } else if (currentY < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      setOpen(false);
      await auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={false}
      animate={{ y: visible ? 0 : "-110%" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      suppressHydrationWarning
    >
      {/* Main bar */}
      <div
        className={[
          "transition-all duration-500",
          scrolled
            ? "border-b border-border/80 bg-background/90 backdrop-blur-xl shadow-[0_4px_20px_-6px_rgba(15,23,42,0.08)]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between gap-6">

            {/* Brand */}
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <HeapifyLogo className="h-6 w-6 rounded-md transition-transform duration-300 group-hover:scale-110" />
              <span className="font-display text-base font-600 tracking-tight text-foreground whitespace-nowrap">
                Heapify
                <span className="hidden sm:inline text-muted-foreground font-400 ml-1">
                  Global
                </span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1.5 text-sm" aria-label="Main navigation">
              {allNavLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 select-none",
                      active
                        ? "text-primary font-semibold"
                        : "text-foreground/75 hover:text-primary"
                    )}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="navbar-active-underline"
                        className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full bg-primary shadow-[0_1px_6px_rgba(255,122,0,0.5)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {mounted && user ? (
                <>
                  {canCreateEvents && (
                    <Link
                      href="/chapter/events/new"
                      className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-xl border border-border/80 bg-card/90 text-foreground/80 hover:text-foreground hover:border-primary/50 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                    >
                      + Event
                    </Link>
                  )}
                  {!isProd && (
                    <Link
                      href="/dashboard"
                      className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-xl border border-border/80 bg-card/90 text-foreground/80 hover:text-foreground hover:border-primary/50 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-xl border border-border/80 bg-card/90 text-foreground/80 hover:text-foreground hover:border-primary/50 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5722] text-white border border-orange-500/20 shadow-[0_4px_14px_-2px_rgba(255,122,0,0.4)] hover:shadow-[0_6px_20px_-2px_rgba(255,122,0,0.55)] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {isSigningOut ? "…" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold rounded-xl border border-border/90 bg-card/90 text-foreground/85 hover:text-primary hover:border-primary/60 hover:bg-card shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_14px_-2px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="hidden sm:inline-flex items-center justify-center px-4.5 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5722] text-white border border-orange-500/25 shadow-[0_4px_14px_-2px_rgba(255,122,0,0.45)] hover:shadow-[0_8px_24px_-4px_rgba(255,122,0,0.65)] hover:brightness-105 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Join Free
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground/70 hover:text-foreground lg:hidden transition-all duration-200 hover:bg-muted/50"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="border-b border-border/80 bg-background/98 backdrop-blur-xl px-5 py-5 space-y-1 lg:hidden"
          >
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex py-2 px-3 text-sm font-medium transition-colors duration-200 border-l-2",
                  isActive(link.href)
                    ? "border-primary text-primary font-semibold bg-primary/5 pl-4"
                    : "border-transparent text-foreground/75 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-border/50 flex flex-col gap-2">
              {mounted && user ? (
                <>
                  {!isProd && (
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm text-foreground/70 py-2 px-3 rounded-xl hover:bg-muted/50 hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <Link href="/profile" onClick={() => setOpen(false)} className="text-sm text-foreground/70 py-2 px-3 rounded-xl hover:bg-muted/50 hover:text-foreground transition-colors">
                    Profile
                  </Link>
                  <button onClick={handleSignOut} disabled={isSigningOut} className="text-left text-sm text-foreground/70 py-2 px-3 rounded-xl hover:bg-muted/50 hover:text-foreground transition-colors">
                    {isSigningOut ? "Signing out…" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-xl border border-border/90 bg-card text-foreground/85 shadow-sm hover:border-primary/50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5722] text-white shadow-[0_4px_14px_-2px_rgba(255,122,0,0.45)] hover:brightness-105 transition-colors"
                  >
                    Join Free →
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
