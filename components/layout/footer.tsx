import Link from "next/link";
import { HeapifyLogo } from "@/components/layout/logo";
import { partners } from "@/lib/site-content";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  { href: "https://github.com/Avi007-debug", label: "GitHub", icon: Github },
  { href: "https://x.com/Heapifyy", label: "Twitter / X", icon: Twitter },
  { href: "https://www.instagram.com/heapify_", label: "Instagram", icon: Instagram },
  { href: "https://www.linkedin.com/in/heapify-global-community-7bb767414/", label: "LinkedIn", icon: Linkedin },
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
      {/* Top glowing orange accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Main content */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5">
        {/* Brand column */}
        <div className="col-span-2 space-y-5">
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
          <div className="flex flex-wrap gap-2 pt-1">
            {partners.map((partner) => (
              <span
                key={partner}
                className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              >
                {partner}
              </span>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-2">
            {socialLinks.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-muted/30 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Link columns */}
        {filteredColumns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
              {col.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <span className="font-mono tracking-wide">
            HEAPIFY_GLOBAL_COMMUNITY © {new Date().getFullYear()}
          </span>
          <span className="font-mono tracking-wide">
            Built to learn. Built to ship.
          </span>
        </div>
      </div>
    </footer>
  );
}