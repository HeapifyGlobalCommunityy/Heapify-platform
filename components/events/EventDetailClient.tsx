"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard, SectionWrapper } from "@/components/site/ui";
import RegistrationForm from "@/components/registration/RegistrationForm";

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURE NOTE
// This is a 100% CSS-transform-driven slide — no Framer Motion, no layout
// animation, no width/padding/margin/max-width transitions anywhere. That's
// deliberate: after extensive testing, animating box-model properties
// (width, padding, margin) inside a flex layout was the root cause of every
// stutter/jank issue in earlier iterations, because those properties force
// the browser to recompute layout on every single frame. `transform` and
// `opacity` are the only two CSS properties that animate on the GPU
// compositor thread without ever touching layout — so that's the only thing
// that moves here, regardless of how much visual flourish sits on top.
//
// Mental model: think of a horizontal filmstrip twice the viewport width.
// Frame 1 (left half) = full event detail page. Frame 2 (right half) =
// the 40/60 compact-summary + registration-form split. Toggling
// `isRegistering` slides the whole strip via `translateX`, revealing
// Frame 2 while Frame 1 recedes with a subtle depth/dim effect.
// ═══════════════════════════════════════════════════════════════════════════

interface AgendaItem { time: string; item: string }
interface Speaker { name: string; role: string }
interface TeamConfig { minSize: number; maxSize: number; allowSolo: boolean }
interface CustomQuestion {
  id: string; label: string;
  type: "select" | "text" | "textarea";
  options?: string[]; required: boolean;
}

interface EventDetailProps {
  slug: string; title: string; category: string; status: string;
  date: string; time: string; location: string; banner?: string;
  agenda?: AgendaItem[]; speakers?: Speaker[];
}

interface MergedEventProps {
  title: string; slug: string; category: string; isHackathon: boolean;
  date: string; time: string; location: string;
  capacity: number; registeredCount: number; bannerUrl: string | null;
  teamConfig: TeamConfig | null; customQuestions: CustomQuestion[];
}

interface Props {
  event: EventDetailProps;
  mergedEvent: MergedEventProps;
  slug: string;
  related: {
    slug: string; title: string; category: string;
    status: string; date: string; time: string; location: string;
    [key: string]: string;
  }[];
  isPast: boolean;
  initialRegistering: boolean;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export default function EventDetailClient({
  event, mergedEvent, slug, related, isPast, initialRegistering,
}: Props) {
  const isDesktop = useIsDesktop();
  const [isRegistering, setIsRegistering] = useState(initialRegistering);
  const [hasEverOpened, setHasEverOpened] = useState(initialRegistering);

  const safeEvent: MergedEventProps = {
    ...mergedEvent,
    teamConfig: mergedEvent.teamConfig ?? null,
    customQuestions: mergedEvent.customQuestions ?? [],
    isHackathon: mergedEvent.isHackathon ?? false,
    capacity: mergedEvent.capacity ?? 0,
    registeredCount: mergedEvent.registeredCount ?? 0,
  };

  const syncUrl = useCallback((registering: boolean) => {
    const url = registering ? `/events/${slug}?register=true` : `/events/${slug}`;
    window.history.replaceState(null, "", url);
  }, [slug]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsRegistering(params.get("register") === "true");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function openRegistration() {
    setIsRegistering(true);
    setHasEverOpened(true);
    syncUrl(true);
  }
  function closeRegistration() {
    setIsRegistering(false);
    syncUrl(false);
  }

  const spotsLeft = safeEvent.capacity - safeEvent.registeredCount;
  const fillPercent = Math.min(100, Math.round((safeEvent.registeredCount / safeEvent.capacity) * 100));

  // ─── MOBILE: no slide, no viewport clipping — just plain conditional
  //     rendering, exactly per spec ("mobile: do NOT animate, just stack").
  //     The whole filmstrip/viewport structure below is desktop-only.
  if (!isDesktop) {
    return (
      <div className="min-h-screen">
        {!isRegistering ? (
          <EventDetailFull
            event={event}
            isPast={isPast}
            related={related}
            onRegister={openRegistration}
          />
        ) : (
          <div className="flex flex-col">
            <CompactSummary
              event={event}
              safeEvent={safeEvent}
              spotsLeft={spotsLeft}
              fillPercent={fillPercent}
              onClose={closeRegistration}
              animated={false}
              isDesktop={false}
            />
            <div className="border-t border-zinc-800">
              {hasEverOpened && <RegistrationForm event={safeEvent} />}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── DESKTOP: the filmstrip slide ───────────────────────────────────────
  // The outer wrapper has screen-level padding so neither panel ever
  // bleeds to the viewport edge — both panels get card-style borders.
  return (
    <div
      className="relative w-full overflow-hidden bg-background"
      style={{ height: "100vh" }}
    >
      {/* Screen-level padding so the cards float inside the viewport */}
      <div className="absolute inset-0 p-4 lg:p-5 overflow-hidden">
        {/* Filmstrip: 200% wide, slides left to reveal Frame 2 */}
        <div
          className="flex h-full transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: "200%",
            transform: isRegistering ? "translateX(-50%)" : "translateX(0%)",
          }}
        >
          {/* ── Frame 1: full detail — recedes with depth+dim on open ── */}
          <div
            className="h-full overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 transition-[transform,opacity,filter] duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: "50%",
              transformOrigin: "right center",
              transform: isRegistering ? "scale(0.94) translateX(-2%)" : "scale(1) translateX(0%)",
              opacity: isRegistering ? 0.5 : 1,
              filter: isRegistering ? "brightness(0.65)" : "brightness(1)",
            }}
          >
            <EventDetailFull
              event={event}
              isPast={isPast}
              related={related}
              onRegister={openRegistration}
            />
          </div>

          {/* ── Frame 2: compact summary + registration form — card border ── */}
          <div
            className="h-full flex rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: "50%",
              marginLeft: "calc(50% - 50% + 0px)",
              transform: isRegistering ? "translateX(0%)" : "translateX(1.5%)",
            }}
          >
            {/* Left: compact summary — 40% of Frame 2 */}
            <div className="w-[40%] h-full overflow-y-auto border-r border-zinc-800">
              <CompactSummary
                event={event}
                safeEvent={safeEvent}
                spotsLeft={spotsLeft}
                fillPercent={fillPercent}
                onClose={closeRegistration}
                animated={isRegistering}
                isDesktop={true}
              />
            </div>
            {/* Right: registration form — 60% of Frame 2 */}
            <div className="w-[60%] h-full overflow-y-auto">
              {hasEverOpened && (
                <div
                  className={[
                    "transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isRegistering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  ].join(" ")}
                  style={{ transitionDelay: isRegistering ? "400ms" : "0ms" }}
                >
                  <RegistrationForm event={safeEvent} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full event detail (Frame 1 content) ───────────────────────────────────

function EventDetailFull({
  event, isPast, related, onRegister,
}: {
  event: EventDetailProps;
  isPast: boolean;
  related: Props["related"];
  onRegister: () => void;
}) {
  return (
    <article className="pt-32">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>

        <div className="mt-8 rounded-[2rem] border border-glass-border relative overflow-hidden
          bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(10,10,10,0.8))] p-10 backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
          </div>

          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-[0.28em] text-primary">
              {event.category} • {event.status}
            </div>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight text-white">
              {event.title}
            </h1>
            {event.banner && (
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{event.banner}</p>
            )}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { icon: <Calendar className="h-4 w-4 text-primary" />, label: "Date", value: event.date },
                { icon: <Clock className="h-4 w-4 text-primary" />, label: "Time", value: event.time },
                { icon: <MapPin className="h-4 w-4 text-primary" />, label: "Location", value: event.location },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-glass-bg shrink-0">
                    {icon}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16 grid gap-12 md:grid-cols-3">
        <div className="md:col-span-2 space-y-12">
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Agenda</h2>
              <div className="mt-6 space-y-4">
                {event.agenda.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-6 rounded-2xl border border-glass-border bg-glass-bg p-5 cursor-default
                      transition-transform duration-200 ease-out hover:-translate-y-[3px] hover:scale-[1.008]"
                  >
                    <div className="font-mono text-sm text-primary/80 shrink-0">{item.time}</div>
                    <div className="text-sm text-foreground/90">{item.item}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Speakers</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {event.speakers.map((speaker, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl border border-glass-border bg-glass-bg p-5 cursor-default
                      transition-transform duration-200 ease-out hover:-translate-y-[3px] hover:scale-[1.008]"
                  >
                    <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{speaker.name}</div>
                      <div className="text-xs text-muted-foreground">{speaker.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div
            className="rounded-3xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl cursor-default
              transition-transform duration-200 ease-out hover:-translate-y-[3px] hover:scale-[1.008]"
          >
            <h3 className="font-display font-semibold text-xl">Registration</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Secure your spot for this experience. Approval required.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {isPast ? (
                <Button disabled className="w-full justify-center opacity-50 cursor-not-allowed">
                  Registration Closed
                </Button>
              ) : (
                <Button className="w-full justify-center" onClick={onRegister}>
                  <Ticket className="mr-2 h-4 w-4" /> Register now
                </Button>
              )}
              <div className="text-center text-xs text-muted-foreground mt-2">
                Registration is managed securely.
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <SectionWrapper title="Related Events" className="border-t border-glass-border">
          <div className="grid gap-5 lg:grid-cols-2">
            {related.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </SectionWrapper>
      )}
    </article>
  );
}

// ─── Compact Summary (Frame 2 left column content) ─────────────────────────
// Filled out with agenda + speakers in condensed form (rather than being
// mostly empty space) — this was a deliberate content decision to make the
// left panel feel substantive during registration, not like a sidebar
// afterthought.

function CompactSummary({
  event, safeEvent, spotsLeft, fillPercent, onClose, animated, isDesktop,
}: {
  event: EventDetailProps;
  safeEvent: MergedEventProps;
  spotsLeft: number;
  fillPercent: number;
  onClose: () => void;
  animated: boolean;
  isDesktop: boolean;
}) {
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    if (!animated) { setBarWidth(0); return; }
    const t = setTimeout(() => setBarWidth(fillPercent), 780);
    return () => clearTimeout(t);
  }, [animated, fillPercent]);

  // `isDesktop` is passed down from the parent's existing useIsDesktop()
  // hook rather than re-detected here — avoids a redundant matchMedia call
  // on every render and avoids any SSR/hydration mismatch risk.
  //
  // `animated` represents "isRegistering" on desktop (where this component
  // stays permanently mounted and needs a real hidden->visible entrance
  // transition). On mobile it's irrelevant, since this component only
  // mounts once registering is already true — no entrance animation needed,
  // just render fully visible immediately.
  function itemClasses(delayMs: number): { className: string; style: CSSProperties } {
    if (!isDesktop) {
      return { className: "opacity-100 translate-y-0", style: {} };
    }
    const base = "transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]";
    return animated
      ? { className: `${base} opacity-100 translate-y-0`, style: { transitionDelay: `${delayMs}ms` } }
      : { className: `${base} opacity-0 translate-y-3`, style: { transitionDelay: "0ms" } };
  }

  return (
    <div className="p-6 lg:p-8 pt-8 lg:pt-10 pb-12 space-y-6">
      <button
        onClick={onClose}
        className={`inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors ${itemClasses(120).className}`}
        style={itemClasses(120).style}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to event
      </button>

      <div className={itemClasses(190).className} style={itemClasses(190).style}>
        <span className="inline-flex border border-primary/40 text-primary text-[10px] font-mono uppercase tracking-[0.28em] px-2.5 py-1 rounded-md">
          {event.category}
        </span>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white leading-tight">
          {event.title}
        </h2>
      </div>

      <div className={`space-y-2 ${itemClasses(260).className}`} style={itemClasses(260).style}>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4 text-zinc-600 shrink-0" />
          <span>{event.date} · {event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MapPin className="h-4 w-4 text-zinc-600 shrink-0" />
          <span>{event.location}</span>
        </div>
      </div>

      <div className={`w-full space-y-2 ${itemClasses(330).className}`} style={itemClasses(330).style}>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-400">Spots available</span>
          <span className="font-mono text-sm text-white">
            <span className={spotsLeft <= 10 ? "text-primary font-bold" : ""}>{spotsLeft}</span>
            <span className="text-zinc-600">&nbsp;/&nbsp;{safeEvent.capacity}</span>
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 font-mono">{fillPercent}% filled</p>
      </div>

      {safeEvent.teamConfig && (
        <div className={`rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-500 font-mono ${itemClasses(380).className}`} style={itemClasses(380).style}>
          Team event · {safeEvent.teamConfig.minSize}–{safeEvent.teamConfig.maxSize} members
          {safeEvent.teamConfig.allowSolo && " · Solo allowed"}
        </div>
      )}

      {/* Condensed agenda — fills the space with genuinely useful content
          instead of leaving it empty, capped to the first 4 items so it
          doesn't overwhelm the panel. */}
      {event.agenda && event.agenda.length > 0 && (
        <div className={`space-y-2.5 pt-2 border-t border-zinc-800 ${itemClasses(430).className}`} style={itemClasses(430).style}>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">Agenda</p>
          {event.agenda.slice(0, 4).map((item, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <span className="font-mono text-primary/70 shrink-0">{item.time}</span>
              <span className="text-zinc-400">{item.item}</span>
            </div>
          ))}
        </div>
      )}

      {event.speakers && event.speakers.length > 0 && (
        <div className={`space-y-2.5 pt-2 border-t border-zinc-800 ${itemClasses(480).className}`} style={itemClasses(480).style}>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">Speakers</p>
          {event.speakers.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full border border-primary/20 bg-primary/10 shrink-0" />
              <div>
                <div className="text-xs font-medium text-white">{s.name}</div>
                <div className="text-[10px] text-zinc-500">{s.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`flex items-center gap-3 pt-2 border-t border-zinc-800 ${itemClasses(520).className}`} style={itemClasses(520).style}>
        <div className="w-7 h-7 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-display font-semibold text-primary">H</span>
        </div>
        <span className="text-xs text-zinc-500">Heapify Global Community</span>
      </div>
    </div>
  );
}
