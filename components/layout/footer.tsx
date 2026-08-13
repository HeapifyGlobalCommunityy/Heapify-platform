import Link from "next/link";
import { HeapifyLogo } from "@/components/layout/logo";
import { partners } from "@/lib/site-content";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  { href: "https://github.com/Avi007-debug", label: "GitHub", icon: Github },
  { href: "https://x.com/Heapifyy", label: "Twitter / X", icon: Twitter },
  { href: "https://www.instagram.com/heapify_", label: "Instagram", icon: Instagram },
  {
    href: "https://www.linkedin.com/in/heapify-global-community-7bb767414/",
    label: "LinkedIn",
    icon: Linkedin,
  },
];

const columns = [
  {
    title: "Community",
    links: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
      { href: "/chapters", label: "Chapters" },
      { href: "/challenges", label: "Challenges" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/open-source", label: "Open Source Hub" },
      { href: "/events", label: "Events" },
      { href: "/internships", label: "Internships" },
      { href: "/resources", label: "Resources" },
    ],
  },
  {
    title: "Partner",
    links: [
      { href: "/sponsor", label: "Sponsors" },
      { href: "/forms/speaker", label: "Become a speaker" },
      { href: "/forms/mentor", label: "Become a mentor" },
      { href: "/forms/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  const isProd =
    process.env.NEXT_PUBLIC_STAGE === "production" ||
    process.env.NODE_ENV === "production";

  const filteredColumns = columns.map((col) => ({
    ...col,
    links: col.links.filter((l) => {
      if (isProd) {
        return ![
          "/challenges",
          "/open-source",
          "/resources",
          "/internships",
          "/sponsor",
        ].includes(l.href);
      }
      return true;
    }),
  }));

  return (
    <footer className="relative mt-24 border-t border-border/60 bg-background">
      {/* Soft top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-primary/[0.03] to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        {/* Top section: Brand + Links */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <HeapifyLogo className="h-5 w-5" />
              <span className="font-display text-sm font-semibold tracking-tight text-foreground">
                Heapify Global Community
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              For Builders, Not Spectators. A technology community for students,
              developers, and builders to learn, collaborate, compete, and create.
            </p>

            {/* Partner badges */}
            <div className="flex flex-wrap gap-2">
              {partners.map((partner) => (
                <span
                  key={partner}
                  className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {partner}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-muted/20 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_12px_-3px] hover:shadow-primary/30"
                  >
                    <Icon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {filteredColumns.map((col) => (
              <div key={col.title} className="space-y-4">
                <h3 className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group relative inline-flex text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        <span className="relative">
                          {l.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <span className="font-mono text-xs tracking-wide text-muted-foreground">
            HEAPIFY_GLOBAL_COMMUNITY © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-xs tracking-wide text-muted-foreground/80">
            Built to learn. Built to ship.
          </span>
        </div>
      </div>
    </footer>
  );
}