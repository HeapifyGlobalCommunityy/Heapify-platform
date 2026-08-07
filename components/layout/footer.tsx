import Link from "next/link";
import { HeapifyLogo } from "@/components/layout/logo";
import { partners } from "@/lib/site-content";

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
  const isProd = process.env.NEXT_PUBLIC_STAGE === "production" || process.env.NODE_ENV === "production";

  const filteredColumns = columns.map((col) => ({
    ...col,
    links: col.links.filter((l) => {
      if (isProd) {
        return !["/challenges", "/open-source", "/resources"].includes(l.href);
      }
      return true;
    }),
  }));

  return (
    <footer className="mt-24 border-t border-glass-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5">
        <div className="col-span-2 space-y-4">
          <div className="mb-3 flex items-center gap-2">
            <HeapifyLogo className="h-5 w-5" />
            <span className="font-display text-sm font-semibold">Heapify Global Community</span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            A premium frontend foundation for a global builders network, designed to scale into Supabase-powered community infrastructure.
          </p>
          <div className="flex flex-wrap gap-2">
            {partners.map((partner) => (
              <span key={partner} className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {partner}
              </span>
            ))}
          </div>
        </div>
        {filteredColumns.map((col) => (
          <div key={col.title}>
            <div className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wide">
              {col.title}
            </div>
            <div className="flex flex-col gap-2">
              {col.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 border-t border-glass-border px-6 py-6 text-xs font-mono text-muted-foreground md:flex-row">
        <span>HEAPIFY_GLOBAL_COMMUNITY © {new Date().getFullYear()}</span>
        <span>Built with Next.js + Supabase</span>
      </div>
    </footer>
  );
}
