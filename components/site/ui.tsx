"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
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

declare global {
  interface Window {
    __heroImageResizeComplete?: boolean;
  }
}

/* ─── ScrollProgressBar ───────────────────────────────────────── */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] pointer-events-none">
      <motion.div
        className="relative h-full w-full bg-gradient-to-r from-[#FF5722] via-[#FF7A00] to-[#FF9100] origin-left shadow-[0_1px_8px_rgba(255,122,0,0.5)]"
        style={{ scaleX }}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-3 bg-gradient-to-r from-transparent to-white/95 rounded-full blur-[1px] shadow-[0_0_10px_rgba(255,122,0,0.9)]" />
      </motion.div>
    </div>
  );
}

/* ─── Shared animation variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
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
  direction = "up",
  distance = 24,
  duration = 0.65,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: distance, x: 0 };
      case "down": return { y: -distance, x: 0 };
      case "left": return { x: distance, y: 0 };
      case "right": return { x: -distance, y: 0 };
      case "none": return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPos }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ willChange: "transform, opacity" }}
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
  title?: string;
  tagline: string;
  description: string;
  actions: Action[];
}) {
  void title;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Silky, over-damped physics for an organic "melting butter" scroll sensation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.25,
    restDelta: 0.0001,
  });

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      setIsInteractive(latest > 0.32);
      const isComplete = latest >= 0.66;
      if (typeof window !== "undefined") {
        window.__heroImageResizeComplete = isComplete;
        window.dispatchEvent(
          new CustomEvent("hero-image-resize", { detail: { isComplete, progress: latest } })
        );
      }
    });
    return () => {
      unsubscribe();
      if (typeof window !== "undefined") {
        window.__heroImageResizeComplete = false;
      }
    };
  }, [smoothProgress]);

  // Desktop transforms: starts full-width (left: 0%, width: 100%), glides to right docked card
  const desktopWidth = useTransform(smoothProgress, [0.10, 0.66], ["100%", "47%"]);
  const desktopLeft = useTransform(smoothProgress, [0.10, 0.66], ["0%", "51%"]);
  const desktopTop = useTransform(smoothProgress, [0.10, 0.66], ["0px", "28px"]);
  const desktopBottom = useTransform(smoothProgress, [0.10, 0.66], ["0px", "28px"]);
  const desktopRadius = useTransform(smoothProgress, [0.10, 0.66], ["0px", "32px"]);
  const desktopScale = useTransform(smoothProgress, [0.10, 0.66], [1.05, 1.0]);
  const desktopShadow = useTransform(
    smoothProgress,
    [0.10, 0.66],
    [
      "0px 0px 0px rgba(0,0,0,0)",
      "0 25px 60px -15px rgba(255, 122, 0, 0.12), 0 12px 36px -10px rgba(15, 23, 42, 0.16)"
    ]
  );
  const desktopBorderWidth = useTransform(smoothProgress, [0.18, 0.66], ["0px", "1px"]);

  // Mobile transforms: starts full height, contracts to top banner
  const mobileHeight = useTransform(smoothProgress, [0.10, 0.66], ["100%", "38%"]);
  const mobileRadius = useTransform(smoothProgress, [0.10, 0.66], ["0px", "28px"]);

  // Floating scroll prompt dissolves immediately on scroll
  const promptOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  const promptY = useTransform(smoothProgress, [0, 0.08], [0, 12]);

  // Photo subtle overlay blends
  const vignetteOpacity = useTransform(smoothProgress, [0, 0.14], [0.45, 0]);

  // Content text transforms:
  // When image is full screen (progress 0), text is completely hidden (opacity 0, blurred, shifted).
  // As user scrolls, text smoothly glides & melts into view like butter on a hot pan.
  const contentOpacity = useTransform(smoothProgress, [0.15, 0.58], [0, 1]);
  const contentY = useTransform(smoothProgress, [0.15, 0.58], [32, 0]);
  const contentBlur = useTransform(smoothProgress, [0.15, 0.52], [10, 0]);
  const contentFilter = useTransform(contentBlur, (b) => `blur(${b}px)`);

  // Staggered buttery feel for inner elements
  const badgeOpacity = useTransform(smoothProgress, [0.18, 0.44], [0, 1]);
  const badgeY = useTransform(smoothProgress, [0.18, 0.44], [18, 0]);

  const headlineOpacity = useTransform(smoothProgress, [0.22, 0.48], [0, 1]);
  const headlineY = useTransform(smoothProgress, [0.22, 0.48], [22, 0]);

  const descOpacity = useTransform(smoothProgress, [0.26, 0.54], [0, 1]);
  const descY = useTransform(smoothProgress, [0.26, 0.54], [18, 0]);

  const actionsOpacity = useTransform(smoothProgress, [0.32, 0.62], [0, 1]);
  const actionsY = useTransform(smoothProgress, [0.32, 0.62], [16, 0]);
  const dolphinOpacity = useTransform(smoothProgress, [0.12, 0.45], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[220vh] lg:h-[240vh] -mt-20">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-end lg:justify-center px-5 sm:px-8 pb-12 lg:pb-0">
        {/* Animated particle background */}
        <AnimatedNetworkBackground />

        {/* Ambient background glow */}
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

        {/* Dolphin Mascot Watermarks (Left top & Right side) */}
        <motion.div
          style={{ opacity: dolphinOpacity }}
          className="pointer-events-none absolute left-3 sm:left-6 lg:left-12 top-20 sm:top-24 lg:top-28 w-28 sm:w-36 md:w-44 aspect-square select-none z-0"
        >
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-14, -8, -14] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full opacity-[0.18] mix-blend-multiply"
          >
            <Image
              src="/heapify-mascot.png"
              alt="Heapify Mascot Watermark"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: dolphinOpacity }}
          className="pointer-events-none absolute right-3 sm:right-6 lg:right-10 top-[52%] -translate-y-1/2 w-28 sm:w-36 md:w-42 aspect-square select-none z-0"
        >
          <motion.div
            animate={{ y: [5, -5, 5], rotate: [12, 18, 12] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full opacity-[0.15] mix-blend-multiply scale-x-[-1]"
          >
            <Image
              src="/heapify-mascot.png"
              alt="Heapify Mascot Watermark"
              fill
              className="object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Animated Hero Photo (Desktop: morphs from full-screen to docked showcase) */}
        <motion.div
          className="absolute hidden lg:block overflow-hidden z-0"
          style={{
            width: desktopWidth,
            left: desktopLeft,
            top: desktopTop,
            bottom: desktopBottom,
            borderRadius: desktopRadius,
            boxShadow: desktopShadow,
            borderWidth: desktopBorderWidth,
            borderColor: "rgba(255, 122, 0, 0.2)",
          }}
        >
          <motion.div className="relative w-full h-full" style={{ scale: desktopScale }}>
            <Image
              src="/images/picofallparticipants.jpg"
              alt="Heapify community gathering"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          </motion.div>

          {/* Initial subtle bottom vignette for scroll prompt */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"
            style={{ opacity: vignetteOpacity }}
          />

        </motion.div>

        {/* Animated Hero Photo (Mobile/Tablet: morphs from full-screen to top banner) */}
        <motion.div
          className="absolute inset-x-0 top-0 lg:hidden overflow-hidden z-0 border-b border-border/60 shadow-md"
          style={{
            height: mobileHeight,
            borderBottomLeftRadius: mobileRadius,
            borderBottomRightRadius: mobileRadius,
          }}
        >
          <Image
            src="/images/picofallparticipants.jpg"
            alt="Heapify community gathering"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </motion.div>

        {/* Content (Appears only on scroll, like butter melting into place) */}
        <motion.div
          style={{
            opacity: contentOpacity,
            y: contentY,
            filter: contentFilter,
          }}
          className={cn(
            "relative z-10 mx-auto w-full max-w-7xl pt-24 lg:pt-0 transition-[pointer-events]",
            isInteractive ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <div className="max-w-3xl xl:max-w-4xl lg:pr-4">
            {/* Eyebrow badge */}
            <motion.div
              style={{ opacity: badgeOpacity, y: badgeY }}
              className="mb-6 lg:mb-8 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border/70 bg-card/85 backdrop-blur-md shadow-sm"
            >
              <HeapifyLogo className="h-5 w-5 rounded-sm" />
              <span className="eyebrow text-foreground/75">
                Heapify Global Community
              </span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span className="eyebrow text-primary">Est. 2024</span>
            </motion.div>

            {/* Main headline — editorial serif */}
            <motion.h1
              style={{ opacity: headlineOpacity, y: headlineY }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[6.25rem] font-600 leading-[1.02] tracking-tight text-foreground mb-6"
            >
              Build with<br />
              <span className="font-serif italic font-normal text-glow inline-block pr-2">
                people
              </span>{" "}
              who ship.
            </motion.h1>

            {/* Tagline */}
            <motion.p
              style={{ opacity: descOpacity, y: descY }}
              className="text-lg sm:text-xl text-foreground/80 font-300 leading-relaxed max-w-lg mb-3"
            >
              {tagline}
            </motion.p>

            {/* Description */}
            <motion.p
              style={{ opacity: descOpacity, y: descY }}
              className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mb-8"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              style={{ opacity: actionsOpacity, y: actionsY }}
              className="flex flex-wrap items-center gap-3"
            >
              {actions.map((action, i) => (
                <Button
                  key={action.href}
                  variant={action.variant === "ghost" ? "ghost" : "primary"}
                  size="lg"
                  className={
                    action.variant === "ghost"
                      ? "border border-border/80 bg-card/80 text-foreground hover:bg-muted/60 hover:text-foreground shadow-sm font-sans"
                      : "font-sans font-medium"
                  }
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
        </motion.div>

        {/* Floating bottom scroll prompt (visible on initial full screen, melts away as you scroll) */}
        <motion.div
          style={{ opacity: promptOpacity, y: promptY }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/25 bg-black/40 backdrop-blur-md text-white shadow-2xl pointer-events-none z-20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/95 font-medium">
            Scroll to explore
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-primary animate-bounce ml-0.5" />
        </motion.div>
      </div>
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
  titleClassName,
  centered = false,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: Action;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  centered?: boolean;
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
            className={cn(
              "mb-10 flex flex-col gap-4 sm:mb-14",
              centered
                ? "items-center text-center mx-auto"
                : "md:flex-row md:items-end md:justify-between"
            )}
          >
            <div className={cn("space-y-3", centered ? "max-w-4xl mx-auto text-center" : "max-w-2xl")}>
              {eyebrow && (
                <div className="eyebrow text-primary/80">{eyebrow}</div>
              )}
              {title && (
                <h2 className={cn("font-display text-display-sm sm:text-display-md lg:text-display-lg font-semibold text-foreground leading-tight tracking-tight", titleClassName)}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={cn("text-base text-muted-foreground leading-7", centered ? "max-w-2xl mx-auto" : "max-w-xl")}>
                  {description}
                </p>
              )}
            </div>
            {action && (
              <Button
                asChild
                variant={action.variant === "ghost" ? "ghost" : "primary"}
                size="sm"
                className={centered ? "mx-auto" : "self-start"}
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
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const ringRotate = useTransform(scrollYProgress, [0, 1], [-10, 15]);
  const ringScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.02, 0.98]);

  return (
    <motion.section
      ref={cardRef}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      className="px-5 py-8 sm:px-8"
    >
      <div className="group mx-auto max-w-4xl overflow-hidden rounded-3xl relative bg-[#FF5722] shadow-[0_16px_40px_-12px_rgba(255,87,34,0.45)] border border-white/20 transition-all duration-500">
        {/* Concentric decorative outline rings matching the community stats card with scroll parallax */}
        <motion.div
          style={{ rotate: ringRotate, scale: ringScale, willChange: "transform" }}
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/15"
        />
        <motion.div
          style={{ rotate: ringRotate, willChange: "transform" }}
          className="pointer-events-none absolute -right-36 -top-36 h-[28rem] w-[28rem] rounded-full border border-white/10"
        />
        <motion.div
          style={{ rotate: ringRotate, scale: ringScale, willChange: "transform" }}
          className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full border border-white/15"
        />
        <motion.div
          style={{ rotate: ringRotate, willChange: "transform" }}
          className="pointer-events-none absolute -left-28 -bottom-28 h-80 w-80 rounded-full border border-white/10"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center p-6 sm:p-8 md:p-9 relative z-10">
          {/* Content Column */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-white drop-shadow-sm">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md font-normal">
              {description}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {actions.map((action, idx) => (
                <Button
                  key={action.href}
                  variant={action.variant === "ghost" ? "ghost" : "primary"}
                  size="md"
                  className={
                    action.variant === "ghost"
                      ? "border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white shadow-sm font-sans backdrop-blur-sm h-10 px-5 text-sm"
                      : "bg-white text-[#FF5722] font-sans font-semibold shadow-md hover:bg-white/95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 h-10 px-5 text-sm"
                  }
                  asChild
                >
                  <Link href={action.href}>
                    {action.label}
                    {idx === 0 && <ArrowRight className="ml-1.5 h-4 w-4" />}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Cleanly Framed Photo Column (Compact) */}
          <div className="md:col-span-5 w-full">
            <div className="relative aspect-[16/10] sm:aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-white/25 shadow-xl">
              <Image
                src="/images/guygivingspeech.jpg"
                alt="Heapify community event"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── AnimatedValue ──────────────────────────────────────────── */
function AnimatedValue({ value, suffix = "+" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const digits = value.toString().split("");

  return (
    <span ref={ref} className="inline-flex items-baseline">
      {digits.map((digit, idx) => {
        const num = parseInt(digit);
        const isNum = !isNaN(num);
        if (!isNum) return <span key={idx}>{digit}</span>;

        return (
          <span key={idx} className="inline-block overflow-hidden h-[1.12em] relative">
            <motion.span
              initial={{ y: "0%" }}
              animate={isInView ? { y: `-${num * 10}%` } : { y: "0%" }}
              transition={{
                duration: 1.8 + idx * 0.25,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1 + idx * 0.08,
              }}
              className="flex flex-col select-none"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n} className="h-[1.12em] flex items-center justify-center">
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
      <span>{suffix}</span>
    </span>
  );
}

/* ─── StatsComponent ─────────────────────────────────────────── */
export function StatsComponent({
  stats,
  centered = true,
}: {
  stats: Array<{ label: string; value: number; detail: string; suffix?: string }>;
  centered?: boolean;
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
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-warm card-warm",
            centered && "text-center"
          )}
        >
          {/* Decorative orange corner */}
          <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-primary/6 group-hover:bg-primary/10 transition-colors duration-400" />

          <div className={cn("relative z-10", centered && "flex flex-col items-center")}>
            <div className="font-display text-4xl sm:text-5xl font-700 tracking-tight text-primary drop-shadow-[0_2px_12px_rgba(255,122,0,0.22)]">
              <AnimatedValue value={stat.value} suffix={stat.suffix ?? "+"} />
            </div>
            <div className="mt-2.5 font-display text-base sm:text-lg font-semibold text-foreground tracking-tight">
              {stat.label}
            </div>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {stat.detail}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── FeatureCard Animation (GPU-accelerated, zero lag) ────────── */
const fastCardEntrance = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: (i % 3) * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ─── FeatureCard ────────────────────────────────────────────── */
export function FeatureCard({
  eyebrow,
  title,
  description,
  centered = false,
  index = 0,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  centered?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={fastCardEntrance}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-warm transition-colors duration-200 hover:border-primary/40 hover:shadow-orange",
        centered && "text-center flex flex-col items-center"
      )}
    >
      {/* Subtle ambient warm glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-wider text-primary font-medium mb-2">{eyebrow}</p>
        )}
        <h3 className="font-display text-xl font-600 tracking-tight mb-3 text-foreground group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
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
