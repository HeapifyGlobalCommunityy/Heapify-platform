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
            ? "border-b border-border/60 bg-[rgba(242,237,227,0.96)] backdrop-blur-xl shadow-[0_2px_24px_-8px_rgba(150,110,60,0.12)]"
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
            <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Main navigation">
              <Link
                href="/"
                className={[
                  "px-3 py-1.5 rounded-full transition-all duration-200 text-sm",
                  isActive("/")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/60",
                ].join(" ")}
              >
                Home
              </Link>
              {isChapterLead && (
                <Link
                  href="/chapter"
                  className={[
                    "px-3 py-1.5 rounded-full transition-all duration-200 text-sm",
                    isActive("/chapter")
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/60",
                  ].join(" ")}
                >
                  Chapter
                </Link>
              )}
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "px-3 py-1.5 rounded-full transition-all duration-200 text-sm",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/60",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2 shrink-0">
              {mounted && user ? (
                <>
                  {canCreateEvents && (
                    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                      <Link href="/chapter/events/new">+ Event</Link>
                    </Button>
                  )}
                  {!isProd && (
                    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/profile">Profile</Link>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? "…" : "Sign Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/signup">Join Free</Link>
                  </Button>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground/70 hover:text-foreground lg:hidden transition-all duration-200 hover:bg-muted/50"
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
            className="border-b border-border/60 bg-[rgba(242,237,227,0.98)] backdrop-blur-xl px-5 py-5 space-y-1 lg:hidden"
          >
            {[{ href: "/", label: "Home" }, ...(isChapterLead ? [{ href: "/chapter", label: "Chapter" }] : []), ...filteredLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={[
                  "flex py-2.5 px-3 rounded-xl text-sm transition-all duration-200",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
                ].join(" ")}
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
                  <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground py-2 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                    Sign In
                  </Link>
                  <Button asChild size="md">
                    <Link href="/signup" onClick={() => setOpen(false)}>Join Free →</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
