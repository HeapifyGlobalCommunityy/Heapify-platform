import Link from "next/link";
import Image from "next/image";
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
      { href: "/forms/speaker", label: "Become a Speaker" },
      { href: "/forms/mentor", label: "Become a Mentor" },
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
        return !["/challenges", "/open-source", "/resources", "/internships", "/sponsor"].includes(l.href);
      }
      return true;
    }),
  }));

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Photo strip accent at very top */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <Image
          src="/images/studsexplainingproj1.jpg"
          alt="Heapify community members collaborating"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--background)) 0%, rgba(232,236,242,0.3) 40%, rgba(232,236,242,0.6) 70%, hsl(var(--background)) 100%)",
          }}
        />
        {/* Centered quote overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-foreground/85 max-w-2xl leading-snug tracking-tight">
            "Built to learn. Built to ship."
          </p>
          <div className="mt-3 h-px w-16 bg-primary/50" />
        </div>
      </div>

      {/* Main footer area */}
      <div className="border-t border-border/50 bg-background">
        {/* Subtle warm top line */}
        <div
          aria-hidden
          className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">

            {/* Brand column */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-2.5">
                <HeapifyLogo className="h-6 w-6 rounded-md" />
                <div>
                  <div className="font-display text-sm font-600 tracking-tight text-foreground">
                    Heapify Global Community
                  </div>
                  <div className="eyebrow text-muted-foreground mt-0.5">
                    For Builders, Not Spectators.
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                A global technology community for students, developers, and
                builders to learn, collaborate, compete, and create real-world
                impact.
              </p>

              {/* Partner badges */}
              {partners.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {partners.map((partner) => (
                    <span
                      key={partner}
                      className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 eyebrow text-muted-foreground hover:border-primary/30 hover:bg-primary/6 hover:text-primary transition-colors duration-200 cursor-default"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              )}

              {/* Social icons */}
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
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/20 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link columns */}
            <div className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {filteredColumns.map((col) => (
                <div key={col.title} className="space-y-4">
                  <h3 className="eyebrow text-foreground/60 font-medium">
                    {col.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground ink-underline"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 divider-warm" />

          {/* Bottom bar */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <span className="eyebrow text-muted-foreground/70">
              Heapify Global Community © {new Date().getFullYear()}
            </span>
            <span className="eyebrow text-muted-foreground/50">
              Made with care in India 🇮🇳
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}