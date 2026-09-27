"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, CalendarDays, ExternalLink, Filter,
  MapPin, Search, Sparkles, Github, Linkedin, ChevronDown
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimatedNetworkBackground } from "@/components/site/background";
import { cn } from "@/lib/utils";
import { HeapifyLogo } from "@/components/layout/logo";

type Action = { label: string; href: string; variant?: "primary" | "ghost" };

/* ─── Shared animation variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" },
  }),
};

/* ─── PageTransition ─────────────────────────────────────────── */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── ScrollReveal ───────────────────────────────────────────── */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      custom={delay / 0.07}
      viewport={{ once: true, amount: 0.08 }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
export function Hero({
  title,
  tagline,
  description,
  actions,
}: {
  title: string;
  tagline: string;
  description: string;
  actions: Action[];
}) {
  return (
    <section className="relative isolate overflow-hidden min-h-[92vh] flex flex-col justify-center px-5 sm:px-8">
      {/* Animated particle background */}
      <AnimatedNetworkBackground />

      {/* Light slate ambient gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,122,0,0.08), transparent 70%),
            radial-gradient(ellipse 40% 50% at 90% 50%, rgba(148,163,184,0.12), transparent 55%),
            radial-gradient(ellipse 40% 40% at 10% 80%, rgba(255,122,0,0.04), transparent 50%)
          `,
        }}
      />

      {/* Full-bleed background image strip (right half) */}
      <div className="absolute inset-y-0 right-0 w-[45%] hidden lg:block overflow-hidden">
        <Image
          src="/images/picofallparticipants.jpg"
          alt="Heapify community gathering"
          fill
          className="object-cover object-center"
          priority
          sizes="45vw"
        />
        {/* Fade image into background */}
        <div className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, hsl(var(--background)) 0%, rgba(232,236,242,0.75) 30%, transparent 65%)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl py-24 md:py-32 lg:py-36">
        <div className="max-w-2xl xl:max-w-3xl">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2.5"
          >
            <HeapifyLogo className="h-5 w-5 rounded-sm" />
            <span className="eyebrow text-foreground/60">
              Heapify Global Community
            </span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span className="eyebrow text-primary">Est. 2024</span>
          </motion.div>

          {/* Main headline — editorial serif */}
          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-600 leading-[1.0] tracking-tight text-foreground mb-6"
          >
            Build with<br />
            <em className="italic text-glow not-italic"
              style={{ fontStyle: "italic", color: "transparent" }}>
              people
            </em>{" "}
            who ship.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
            className="text-lg sm:text-xl text-foreground/70 font-300 leading-relaxed max-w-xl mb-3"
          >
            {tagline}
          </motion.p>

          {/* Description */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="text-base text-muted-foreground leading-7 max-w-lg mb-10"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={3}
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3"
          >
            {actions.map((action, i) => (
              <Button
                key={action.href}
                variant={action.variant === "ghost" ? "warm" : "primary"}
                size="lg"
                asChild
              >
                <Link href={action.href}>
                  {action.label}
                  {i === 0 && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Link>
              </Button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-foreground/35"
      >
        <span className="eyebrow text-[9px]">scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── SectionWrapper ─────────────────────────────────────────── */
export function SectionWrapper({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: Action;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-5 py-16 sm:px-8 md:py-24", className)}>
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || description || action) && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-2xl space-y-3">
              {eyebrow && (
                <div className="eyebrow text-primary/80">{eyebrow}</div>
              )}
              {title && (
                <h2 className="font-display text-display-sm sm:text-display-md lg:text-display-lg font-600 text-foreground leading-tight tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-base text-muted-foreground leading-7 max-w-xl">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <Button
                asChild
                variant={action.variant === "ghost" ? "ghost" : "primary"}
                size="sm"
                className="self-start"
              >
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ─── CTAComponent ───────────────────────────────────────────── */
export function CTAComponent({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: Action[];
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      className="px-5 py-12 sm:px-8"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl relative">
        {/* Background — community photo with warm overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/guygivingspeech.jpg"
            alt="Heapify community event"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg,
                rgba(232,236,242,0.97) 0%,
                rgba(232,236,242,0.88) 35%,
                rgba(232,236,242,0.70) 65%,
                rgba(255,122,0,0.15) 100%)`,
            }}
          />
        </div>

        {/* Border & shadow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-border/50" />

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-12 md:p-16">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="eyebrow text-primary">Premium community</span>
            </div>
            <h3 className="font-display text-display-sm sm:text-display-md font-600 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-base text-muted-foreground leading-7">{description}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              {actions.map((action) => (
                <Button
                  key={action.href}
                  variant={action.variant === "ghost" ? "warm" : "primary"}
                  size="lg"
                  asChild
                >
                  <Link href={action.href}>
                    {action.label}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── AnimatedValue ──────────────────────────────────────────── */
function AnimatedValue({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (time: number) => {
      const elapsed = time - startedAt;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value]);

  return <span ref={ref}>{current.toLocaleString()}+</span>;
}

/* ─── StatsComponent ─────────────────────────────────────────── */
export function StatsComponent({
  stats,
}: {
  stats: Array<{ label: string; value: number; detail: string }>;
}) {
  const gridCols =
    stats.length === 1 ? "max-w-sm mx-auto grid-cols-1"
    : stats.length === 2 ? "max-w-2xl mx-auto sm:grid-cols-2"
    : stats.length === 3 ? "sm:grid-cols-3"
    : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 sm:gap-5 ${gridCols}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial="hidden"
          whileInView="show"
          custom={index}
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-warm card-warm"
        >
          {/* Decorative orange corner */}
          <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-primary/6 group-hover:bg-primary/10 transition-colors duration-400" />

          <div className="relative z-10">
            <div className="font-display text-4xl font-700 tracking-tight text-foreground sm:text-5xl">
              <AnimatedValue value={stat.value} />
            </div>
            <div className="mt-2 eyebrow text-primary font-medium">
              {stat.label}
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {stat.detail}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── FeatureCard ────────────────────────────────────────────── */
export function FeatureCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      className="group rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/35 hover:shadow-warm-lg hover:-translate-y-1"
    >
      <div className="eyebrow text-primary/90 font-medium mb-4">{eyebrow}</div>
      <h3 className="font-display text-xl font-600 tracking-tight mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-7">{description}</p>
    </motion.div>
  );
}

/* ─── EventCard ──────────────────────────────────────────────── */
export function EventCard({
  event,
  compact = false,
}: {
  event: {
    slug: string; title: string; category: string; status: string;
    date: string; time: string; location: string;
    summary?: string; spotlight?: string; format?: string; description?: string;
  };
  compact?: boolean;
}) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/30 hover:shadow-warm-lg",
        compact && "p-5"
      )}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow text-muted-foreground mb-2">{event.category}</div>
          <h3 className={cn("font-display font-600 tracking-tight text-foreground", compact ? "text-lg" : "text-xl")}>
            {event.title}
          </h3>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <p className={cn("relative mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground", compact && "text-[13px]")}>
        {event.summary ?? event.description}
      </p>

      <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs text-foreground/80">
        <MetaItem icon={CalendarDays} label={event.date} />
        <MetaItem icon={MapPin} label={event.location} />
      </div>

      <div className="relative mt-auto pt-5">
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
        >
          View details
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}

/* ─── EventCardWide ──────────────────────────────────────────── */
export function EventCardWide({
  event,
}: {
  event: {
    slug: string; title: string; category: string; status: string;
    date: string; time: string; location: string; format?: string;
    description?: string; summary?: string; spotlight?: string;
  };
}) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-warm transition-all duration-300 hover:border-primary/30 hover:shadow-warm-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/8 px-3 py-1 eyebrow text-primary">
              {event.category}
            </span>
            <StatusBadge status={event.status} />
            {event.format && (
              <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 eyebrow text-muted-foreground">
                {event.format}
              </span>
            )}
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-600 tracking-tight text-foreground">
            {event.title}
          </h3>
          {(event.summary || event.description) && (
            <p className="text-sm text-muted-foreground leading-6 max-w-2xl line-clamp-2">
              {event.summary ?? event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-foreground/75">
              <CalendarDays className="h-3 w-3 text-primary" />
              {event.date}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-foreground/75">
              <MapPin className="h-3 w-3 text-primary" />
              {event.location}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Button asChild size="sm">
            <Link href={`/events/${event.slug}`}>
              View event
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── MetaItem ───────────────────────────────────────────────── */
function MetaItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground">
      <Icon className="h-3 w-3 text-primary shrink-0" />
      <span className="line-clamp-1">{label}</span>
    </div>
  );
}

/* ─── ProjectCard ────────────────────────────────────────────── */
export function ProjectCard({
  project,
}: {
  project: {
    slug: string; title: string; description: string;
    stack: string[]; impact: string; members: string;
  };
}) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="group rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/30 hover:shadow-warm-lg"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="eyebrow text-muted-foreground mb-2">{project.members}</div>
          <h3 className="font-display text-xl font-600 tracking-tight">{project.title}</h3>
        </div>
        <div className="h-11 w-11 rounded-xl border border-primary/20 bg-primary/8 flex items-center justify-center shrink-0">
          <div className="h-4 w-4 rounded-sm bg-primary/60" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-6">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((item) => (
          <span key={item} className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
        <span className="text-xs">{project.impact}</span>
        <Link href={`/open-source/${project.slug}`} className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors text-xs">
          Explore <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.article>
  );
}

/* ─── TeamCard ───────────────────────────────────────────────── */
export function TeamCard({
  member,
}: {
  member: {
    name: string; role: string; bio: string;
    links: Array<{ platform: string; url: string }>;
  };
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/30 hover:shadow-warm-lg"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="eyebrow text-primary/85 mb-2">{member.role}</div>
          <h3 className="font-display text-lg font-600 tracking-tight">{member.name}</h3>
        </div>
        <div className="h-11 w-11 rounded-2xl border border-border/60 bg-gradient-to-br from-steel-200 to-steel-300 shrink-0" />
      </div>
      <p className="text-sm text-muted-foreground leading-6">{member.bio}</p>
      <div className="mt-4 flex items-center gap-2">
        {member.links.map((link) => {
          const Icon = link.platform === "github" ? Github : Linkedin;
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on ${link.platform}`}
              className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/8 transition-all duration-200"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          );
        })}
      </div>
    </motion.article>
  );
}

/* ─── SocialCard ─────────────────────────────────────────────── */
export function SocialCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="block rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/30 hover:shadow-warm-lg cursor-pointer"
    >
      <h3 className="font-display text-xl font-600 tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-6">{description}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
        Open channel
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </motion.a>
  );
}

/* ─── FormCard ───────────────────────────────────────────────── */
export function FormCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/30"
    >
      <div className="eyebrow text-muted-foreground mb-3">Application</div>
      <h3 className="font-display text-xl font-600 tracking-tight mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-6">{description}</p>
      <div className="mt-5 flex gap-2.5">
        <Button asChild size="sm">
          <Link href={`/forms/${type}`}>Open form</Link>
        </Button>
        <Button variant="warm" size="sm" asChild>
          <Link href="/about">Learn more</Link>
        </Button>
      </div>
    </motion.article>
  );
}

/* ─── StatusBadge ────────────────────────────────────────────── */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const s = status.toLowerCase();
  const colors =
    s === "active" || s === "open" || s === "upcoming"
      ? "border-primary/25 bg-primary/8 text-primary"
      : s === "ongoing"
      ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-700"
      : "border-border/70 bg-muted/40 text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 eyebrow shrink-0",
        colors,
        className
      )}
    >
      {status}
    </span>
  );
}

/* ─── EventsExplorer ─────────────────────────────────────────── */
export function EventsExplorer({
  events,
  pastEvents = [],
  categories,
}: {
  events: Array<{ slug: string; title: string; category: string; status: string; date: string; time: string; format: string; location: string; description: string }>;
  pastEvents?: typeof events;
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");

  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const q = [event.title, event.category, event.location, event.description].join(" ").toLowerCase();
        return (
          q.includes(query.toLowerCase()) &&
          (activeCategory === "All" || event.category === activeCategory) &&
          (activeStatus === "All" || event.status === activeStatus)
        );
      }),
    [activeCategory, activeStatus, events, query]
  );

  return (
    <div className="space-y-6">
      {/* Search & filter bar */}
      <div className="grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-warm md:grid-cols-[1.2fr_0.8fr]">
        <label className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5 text-sm">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search events"
            placeholder="Search events, speakers, or locations…"
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </label>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Dropdown
            options={categories}
            value={activeCategory}
            onChange={setActiveCategory}
            icon={<Filter className="h-4 w-4 text-primary" />}
            buttonClassName="flex w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5 text-xs text-foreground hover:border-primary/35 transition-all duration-150"
          />
          <Dropdown
            options={["All", "Upcoming", "Ongoing", "Completed"]}
            value={activeStatus}
            onChange={setActiveStatus}
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            buttonClassName="flex w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5 text-xs text-foreground hover:border-primary/35 transition-all duration-150"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try adjusting your search or filters."
            actionLabel="Clear filters"
            onAction={() => { setQuery(""); setActiveCategory("All"); setActiveStatus("All"); }}
          />
        ) : (
          filtered.map((event, index) => (
            <motion.div
              key={event.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <EventCardWide event={event} />
            </motion.div>
          ))
        )}
      </div>

      {/* Past events */}
      {pastEvents.length > 0 && (
        <div className="mt-16 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/50" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 eyebrow text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Past events
            </div>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="flex flex-col gap-4">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="opacity-55 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-400"
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

/* ─── ResourcesExplorer ──────────────────────────────────────── */
export function ResourcesExplorer({
  resources,
}: {
  resources: Array<{ title: string; slug: string; description: string; meta: string }>;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      resources.filter((item) =>
        [item.title, item.description, item.meta].join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [query, resources]
  );

  return (
    <div className="space-y-6">
      <label className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card px-4 py-3.5 text-sm shadow-warm">
        <Search className="h-4 w-4 text-primary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resources"
          placeholder="Search blogs, roadmaps, recordings…"
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((resource, index) => (
          <motion.article
            key={resource.title}
            initial="hidden"
            whileInView="show"
            custom={index}
            viewport={{ once: true, amount: 0.05 }}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border/80 bg-card p-5 shadow-warm transition-all duration-300 hover:border-primary/30"
          >
            <div className="eyebrow text-primary/85 mb-3">{resource.meta}</div>
            <h3 className="font-display text-lg font-600 tracking-tight mb-2">{resource.title}</h3>
            <p className="text-sm text-muted-foreground leading-6">{resource.description}</p>
            <Link
              href={`/resources/${resource.slug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Open resource <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

/* ─── BentoGrid / BentoCard ──────────────────────────────────── */
export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-4 sm:gap-5", className)}>{children}</div>;
}

export function BentoCard({
  eyebrow,
  title,
  description,
  className,
  index = 0,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  index?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      custom={index}
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-warm transition-all duration-300 hover:border-primary/30 hover:shadow-warm-lg",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl" />
      <div className="relative z-10">
        {eyebrow && <div className="eyebrow text-primary/85 mb-3">{eyebrow}</div>}
        {title && <h3 className="font-display text-xl font-600 tracking-tight mb-2">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground leading-6">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  );
}

/* ─── CategoryResourcesClient ────────────────────────────────── */
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
  const allTags = useMemo(
    () => Array.from(new Set(resources.flatMap((r) => r.tags || []))),
    [resources]
  );
  const filteredResources = useMemo(
    () => (!activeTag ? resources : resources.filter((r) => r.tags?.includes(activeTag))),
    [resources, activeTag]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <Link href="/resources" className="eyebrow text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
          ← Back to resources
        </Link>
        <span className="eyebrow text-muted-foreground">Page {page}</span>
      </div>

      {allTags.length > 0 && (
        <div className="py-3 border-y border-border/50">
          <div className="eyebrow text-muted-foreground mb-2.5">Filter results</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "rounded-full border px-3.5 py-1 eyebrow transition-all duration-200",
                !activeTag ? "border-primary/35 bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={cn(
                  "rounded-full border px-3.5 py-1 eyebrow transition-all duration-200",
                  tag === activeTag ? "border-primary/35 bg-primary/8 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <EmptyState title="No resources found" description={`No resources in ${categoryTitle} yet.`} />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No matching resources"
          description={`No resources tagged with "${activeTag}".`}
          actionLabel="Clear filter"
          onAction={() => setActiveTag(null)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource, index) => (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              key={resource.url + index}
              className="group block rounded-2xl border border-border/80 bg-card p-5 shadow-warm hover:border-primary/30 hover:shadow-warm-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="eyebrow text-muted-foreground">
                  {new Date(resource.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
              <h3 className="font-display text-base font-600 tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {resource.title}
              </h3>
              <p className="eyebrow text-primary/70 truncate">{resource.url}</p>
              {resource.tags && resource.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {resource.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex items-center justify-between pt-8 border-t border-border/50 mt-12">
          {page > 1 ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`?page=${page - 1}`}>← Previous</Link>
            </Button>
          ) : <div />}
          {hasNextPage ? (
            <Button size="sm" asChild>
              <Link href={`?page=${page + 1}`}>Next →</Link>
            </Button>
          ) : <div />}
        </div>
      )}
    </div>
  );
}
