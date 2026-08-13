"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, ExternalLink, Filter, MapPin, Search, Sparkles, Github, Linkedin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimatedNetworkBackground } from "@/components/site/background";
import { cn } from "@/lib/utils";

type Action = { label: string; href: string; variant?: "primary" | "ghost" };
import { HeapifyLogo } from "@/components/layout/logo";

export function SectionWrapper({ eyebrow, title, description, action, children, className }: { eyebrow?: string; title?: string; description?: string; action?: Action; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("px-4 py-12 sm:px-6 md:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || description || action) && (
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.5 }} className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-2.5 sm:space-y-3">
              {eyebrow ? <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">{eyebrow}</div> : null}
              {title ? <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-5xl">{title}</h2> : null}
              {description ? <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{description}</p> : null}
            </div>
            {action ? (
              <Button asChild variant={action.variant === "ghost" ? "ghost" : "primary"} className="self-start md:self-auto">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : null}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

export function CTAComponent({ title, description, actions }: { title: string; description: string; actions: Action[] }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.55 }} className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(135deg,rgba(255,122,0,0.14),rgba(255,255,255,0.03),rgba(10,10,10,0.65))] p-6 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_40px_120px_-60px_rgba(255,122,0,0.55)] sm:p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">premium community infrastructure</span>
          </div>
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-5xl">{title}</h3>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            {actions.map((action) => (
              <Button key={action.href} variant={action.variant === "ghost" ? "ghost" : "primary"} asChild className="w-full sm:w-auto">
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

import { useInView } from "framer-motion";

function AnimatedValue({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2200;
    const startedAt = performance.now();
    let raf = 0;

    const tick = (time: number) => {
      const elapsed = time - startedAt;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * easeOut));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value]);

  return <span ref={ref}>{current.toLocaleString()}+</span>;
}

export function StatsComponent({ stats }: { stats: Array<{ label: string; value: number; detail: string }> }) {
  const gridCols =
    stats.length === 1
      ? "max-w-md mx-auto grid-cols-1"
      : stats.length === 2
        ? "max-w-2xl mx-auto sm:grid-cols-2"
        : stats.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 sm:gap-5 ${gridCols}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-[1.5rem] border border-glass-border bg-glass-bg p-5 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_40px_-20px_rgba(255,122,0,0.2)] flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.08),transparent_50%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              <AnimatedValue value={stat.value} />
            </div>
            <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.24em] text-primary/90 font-medium">
              {stat.label}
            </div>
            <p className="mt-2.5 text-xs leading-5 text-muted-foreground line-clamp-2">
              {stat.detail}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function FeatureCard({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.25 }} className="group rounded-[1.5rem] border border-border/60 bg-zinc-200/70 p-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-40px_rgba(255,122,0,0.5)] dark:bg-muted/40 backdrop-blur-xl dark:hover:bg-muted/60 hover:border-primary/30 transition-colors">
      <div className="text-[11px] font-mono uppercase tracking-[0.32em] text-primary/75">{eyebrow}</div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
    </motion.div>
  );
}

export function EventCard({ event, compact = false }: { event: { slug: string; title: string; category: string; status: string; date: string; time: string; location: string; summary?: string; spotlight?: string; format?: string; description?: string }; compact?: boolean }) {
  return (
    <motion.article whileHover={{ y: -7 }} transition={{ duration: 0.25 }} className={cn("group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 backdrop-blur-xl", compact && "p-5")}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">{event.category}</div>
          <h3 className={cn("mt-3 font-display font-semibold tracking-tight", compact ? "text-lg" : "text-2xl")}>{event.title}</h3>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">{event.status}</span>
      </div>
      <p className={cn("relative mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground", compact && "text-[13px]")}>{event.summary ?? event.description}</p>
      <div className="relative mt-5 grid grid-cols-2 gap-3 text-sm text-foreground/90">
        <MetaItem icon={CalendarDays} label={event.date} />
        <MetaItem icon={ExternalLink} label={event.time} />
        <MetaItem icon={Filter} label={event.location} />
        <MetaItem icon={Sparkles} label={event.spotlight ?? event.format ?? "Live"} />
      </div>
      <div className="relative mt-auto pt-6">
        <Button variant="ghost" asChild className="w-full justify-between">
          <Link href={`/events/${event.slug}`}>
            View details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}

export function EventCardWide({ event }: { event: { slug: string; title: string; category: string; status: string; date: string; time: string; location: string; format?: string; description?: string; summary?: string; spotlight?: string } }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_40px_-16px_rgba(255,122,0,0.18)] dark:border-glass-border dark:bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] dark:hover:shadow-[0_12px_40px_-16px_rgba(255,122,0,0.28)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(255,122,0,0.08),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">{event.category}</span>
            <span className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{event.status}</span>
            {event.format && <span className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{event.format}</span>}
          </div>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{event.title}</h3>
          {(event.summary || event.description) && (
            <p className="text-sm leading-7 text-muted-foreground max-w-2xl line-clamp-2">{event.summary ?? event.description}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs text-foreground/70">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />{event.date}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs text-foreground/70">
              <MapPin className="h-3.5 w-3.5 text-primary" />{event.location}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-3 md:flex-col md:items-end md:shrink-0">
          <Button asChild>
            <Link href={`/events/${event.slug}`}>View event <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function MetaItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-3 py-2 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="line-clamp-1">{label}</span>
    </div>
  );
}

export function ProjectCard({ project }: { project: { slug: string; title: string; description: string; stack: string[]; impact: string; members: string } }) {
  return (
    <motion.article whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="group rounded-[1.75rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">{project.members}</div>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{project.title}</h3>
        </div>
        <div className="h-12 w-12 rounded-2xl border border-primary/20 bg-primary/10 shadow-[0_0_30px_rgba(255,122,0,0.15)]" />
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <span key={item} className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item}</span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>{project.impact}</span>
        <Link href={`/open-source/${project.slug}`} className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors">
          Explore
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

export function TeamCard({ member }: { member: { name: string; role: string; bio: string; links: Array<{ platform: string; url: string }> } }) {
  return (
    <motion.article whileHover={{ y: -5 }} transition={{ duration: 0.25 }} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80">{member.role}</div>
          <h3 className="font-display text-xl font-semibold tracking-tight">{member.name}</h3>
        </div>
        <div className="h-12 w-12 rounded-2xl border border-glass-border bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_62%)]" />
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{member.bio}</p>
      <div className="mt-5 flex items-center gap-3">
        {member.links.map((link) => {
          const Icon = link.platform === "github" ? Github : Linkedin;
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-[0_0_15px_rgba(255,122,0,0.2)] transition-all duration-300 dark:border-glass-border dark:bg-glass-bg"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </motion.article>
  );
}

export function SocialCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="block rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl cursor-pointer"
    >
      <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm text-primary">
        Open channel
        <ExternalLink className="h-4 w-4" />
      </div>
    </motion.a>
  );
}

export function FormCard({ title, description, type }: { title: string; description: string; type: string }) {
  return (
    <motion.article whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="rounded-[1.5rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 backdrop-blur-xl">
      <div className="text-[11px] font-mono uppercase tracking-[0.32em] text-muted-foreground">Form</div>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button asChild><Link href={`/forms/${type}`}>Open form</Link></Button>
        <Button variant="ghost" asChild><Link href="/about">Learn more</Link></Button>
      </div>
    </motion.article>
  );
}

export function Hero({ title, tagline, description, actions }: { title: string; tagline: string; description: string; actions: Action[] }) {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-20 pt-28 sm:px-6 md:pb-32 md:pt-40">
      <AnimatedNetworkBackground />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, var(--hero-overlay-from), var(--hero-overlay-mid) 65%, var(--hero-overlay-to))`,
        }}
      />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <div className="mb-6 flex max-w-full items-center gap-3 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur-md sm:mb-8 sm:gap-4 sm:px-4 sm:py-2 sm:text-xs">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_18px_rgba(255,122,0,0.8)]" />
          <span className="truncate">Premium builder community platform</span>
        </div>
        <HeapifyLogo className="h-16 w-16 sm:h-20 sm:w-20 shadow-[0_0_60px_rgba(255,122,0,0.22)]" />
        <div className="mt-6 max-w-5xl space-y-4 sm:mt-8 sm:space-y-6">
          <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">{title}</h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{tagline}</p>
          <p className="mx-auto max-w-3xl text-sm leading-6 text-muted-foreground sm:leading-7 md:text-base">{description}</p>
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row">
          {actions.map((action) => (
            <Button key={action.href} variant={action.variant === "ghost" ? "ghost" : "primary"} asChild size="lg" className="w-full sm:w-auto">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function EventsExplorer({ events, pastEvents = [], categories }: { events: Array<{ slug: string; title: string; category: string; status: string; date: string; time: string; format: string; location: string; description: string }>; pastEvents?: Array<{ slug: string; title: string; category: string; status: string; date: string; time: string; format: string; location: string; description: string }>; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");

  const filtered = useMemo(() => events.filter((event) => {
    const matchesQuery = [event.title, event.category, event.location, event.description].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const matchesStatus = activeStatus === "All" || event.status === activeStatus;
    return matchesQuery && matchesCategory && matchesStatus;
  }), [activeCategory, activeStatus, events, query]);

  return (
    <div className="space-y-6">
      <div className="relative z-10 grid gap-4 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm dark:border-glass-border dark:bg-glass-bg dark:backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr]">
        <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground dark:border-glass-border dark:bg-black/20">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, speakers, or locations" className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Dropdown
            options={categories}
            value={activeCategory}
            onChange={setActiveCategory}
            icon={<Filter className="h-4 w-4 text-primary" />}
            buttonClassName="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-xs text-foreground hover:border-primary/30 hover:text-primary transition-all duration-150 dark:border-glass-border dark:bg-black/20 dark:text-muted-foreground dark:hover:text-foreground"
          />
          <Dropdown
            options={["All", "Upcoming", "Ongoing", "Completed"]}
            value={activeStatus}
            onChange={setActiveStatus}
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            buttonClassName="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-xs text-foreground hover:border-primary/30 hover:text-primary transition-all duration-150 dark:border-glass-border dark:bg-black/20 dark:text-muted-foreground dark:hover:text-foreground"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button key={category} onClick={() => setActiveCategory(category)} className={cn("rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors", activeCategory === category ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground dark:border-glass-border dark:bg-glass-bg")}>
            {category}
          </button>
        ))}
      </div>
      {/* ── Active events ── */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No events found"
            description="No events match your current search or filters. Try clearing them."
            actionLabel="Clear filters"
            onAction={() => { setQuery(""); setActiveCategory("All"); setActiveStatus("All"); }}
          />
        ) : (
          filtered.map((event, index) => (
            <motion.div key={event.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.45, delay: index * 0.04 }}>
              <EventCardWide event={event} />
            </motion.div>
          ))
        )}
      </div>

      {/* ── Past events archive — always below, always full width ── */}
      {pastEvents.length > 0 && (
        <div className="mt-16 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-glass-border" />
            <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              Past events
            </div>
            <div className="h-px flex-1 bg-glass-border" />
          </div>
          <p className="text-xs text-muted-foreground/60 text-center">
            These events have concluded. Their detail pages and recordings remain accessible.
          </p>
          <div className="flex flex-col gap-4">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="opacity-60 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-300 [&_*]:pointer-events-auto"
              >
                <EventCardWide event={event} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ResourcesExplorer({ resources }: { resources: Array<{ title: string; slug: string; description: string; meta: string }> }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => resources.filter((item) => [item.title, item.description, item.meta].join(" ").toLowerCase().includes(query.toLowerCase())), [query, resources]);

  return (
    <div className="space-y-6">
      <label className="flex items-center gap-3 rounded-[1.5rem] border border-glass-border bg-glass-bg px-4 py-4 text-sm text-muted-foreground backdrop-blur-xl">
        <Search className="h-4 w-4 text-primary" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blogs, roadmaps, recordings, and notes" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
      </label>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((resource, index) => (
          <motion.article key={resource.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.45, delay: index * 0.04 }} whileHover={{ y: -4 }} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-5 backdrop-blur-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80">{resource.meta}</div>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{resource.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{resource.description}</p>
            <Button variant="ghost" asChild className="mt-5 w-full justify-between">
              <Link href={`/resources/${resource.slug}`}>
                Open resource
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: "easeOut" }} className="relative">
      {children}
    </motion.div>
  );
}

export function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-5", className)}>
      {children}
    </div>
  );
}

export function BentoCard({ eyebrow, title, description, className, index = 0, children }: { eyebrow?: string; title?: string; description?: string; className?: string; index?: number; children?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.005 }}
      className={cn("group relative overflow-hidden rounded-[1.5rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 backdrop-blur-xl", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.12),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        {eyebrow && <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">{eyebrow}</div>}
        {title && <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{title}</h3>}
        {description && <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </motion.div>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  let colors = "border-glass-border bg-glass-bg text-muted-foreground";
  if (status.toLowerCase() === "active" || status.toLowerCase() === "open") {
    colors = "border-primary/30 bg-primary/10 text-primary";
  } else if (status.toLowerCase() === "upcoming" || status.toLowerCase() === "soon") {
    colors = "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em]", colors, className)}>
      {status}
    </span>
  );
}

export function CategoryResourcesClient({
  resources,
  hasNextPage,
  page,
  categoryTitle,
}: {
  resources: Array<{ title: string; url: string; tags: string[] | null; created_at: string }>;
  hasNextPage: boolean;
  page: number;
  categoryTitle: string;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    return Array.from(new Set(resources.flatMap((r) => r.tags || [])));
  }, [resources]);

  const filteredResources = useMemo(() => {
    if (!activeTag) return resources;
    return resources.filter((r) => r.tags?.includes(activeTag));
  }, [resources, activeTag]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <Link
          href="/resources"
          className="text-xs uppercase tracking-[0.24em] text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
        >
          ← Back to resources
        </Link>
        <span className="text-xs font-mono text-muted-foreground">
          Showing Page {page}
        </span>
      </div>

      {allTags.length > 0 && (
        <div className="py-3 border-y border-glass-border">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Filter this page&apos;s results</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors",
                !activeTag
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-glass-border bg-glass-bg text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors",
                  tag === activeTag
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-glass-border bg-glass-bg text-muted-foreground hover:text-foreground"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description={`We haven't added any resources to the ${categoryTitle} category yet. Check back soon!`}
        />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No matching resources"
          description={`No resources under ${categoryTitle} are tagged with "${activeTag}".`}
          actionLabel="Clear tag filter"
          onAction={() => setActiveTag(null)}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource, index) => (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              key={resource.url + index}
              className="group block rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.08),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                      {new Date(resource.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>

                  <p className="mt-2 text-xs text-primary/80 truncate font-mono">
                    {resource.url}
                  </p>
                </div>

                {(resource.tags && resource.tags.length > 0) ? (
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-glass-border bg-glass-bg/50 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex items-center justify-between pt-8 border-t border-glass-border mt-12">
          {page > 1 ? (
            <Button variant="ghost" asChild>
              <Link href={`?page=${page - 1}`}>
                ← Previous Page
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {hasNextPage ? (
            <Button variant="ghost" asChild>
              <Link href={`?page=${page + 1}`}>
                Next Page →
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
