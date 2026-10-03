"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/site/ui";
import RegistrationForm from "@/components/registration/RegistrationForm";
import { ExportRegistrationsButton } from "@/components/events/ExportRegistrationsButton";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";
import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";

interface AgendaItem {
  time: string;
  item: string;
  title?: string;
}

interface Speaker {
  name: string;
  role?: string;
  bio?: string;
  photo_url?: string;
}

interface TeamConfig {
  minSize: number;
  maxSize: number;
  allowSolo: boolean;
}

type QuestionType = "short_text" | "long_text" | "single_choice" | "multiple_choice" | "number";

interface CustomQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

interface EventDetailProps {
  slug: string;
  title: string;
  category: string;
  status: string;
  date: string;
  time: string;
  location: string;
  description: string;
  banner?: string;
  chapterName?: string | null;
  agenda?: AgendaItem[];
  speakers?: Speaker[];
}

interface MergedEventProps {
  title: string;
  slug: string;
  category: string;
  isHackathon: boolean;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  bannerUrl: string | null;
  teamConfig: TeamConfig | null;
  customQuestions: CustomQuestion[];
}

interface Props {
  event: EventDetailProps;
  mergedEvent: MergedEventProps;
  slug: string;
  related: {
    slug: string;
    title: string;
    category: string;
    status: string;
    date: string;
    time: string;
    location: string;
    [key: string]: string;
  }[];
  isPast: boolean;
  initialRegistering: boolean;
  canExportRegistrations: boolean;
}

export default function EventDetailClient({
  event,
  mergedEvent,
  slug,
  related,
  isPast,
  initialRegistering,
  canExportRegistrations,
}: Props) {
  const [isRegistering, setIsRegistering] = useState(initialRegistering);

  const safeEvent: MergedEventProps = {
    ...mergedEvent,
    teamConfig: mergedEvent.teamConfig ?? null,
    customQuestions: mergedEvent.customQuestions ?? [],
    isHackathon: mergedEvent.isHackathon ?? false,
    capacity: mergedEvent.capacity ?? 0,
    registeredCount: mergedEvent.registeredCount ?? 0,
  };

  const syncUrl = useCallback(
    (registering: boolean) => {
      const url = registering ? `/events/${slug}?register=true` : `/events/${slug}`;
      window.history.replaceState(null, "", url);
    },
    [slug]
  );

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsRegistering(params.get("register") === "true");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  async function openRegistration() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/login?redirectTo=${encodeURIComponent(
          `/events/${slug}?register=true`
        )}`;
        return;
      }
    }
    setIsRegistering(true);
    syncUrl(true);
    window.scrollTo({ top: 380, behavior: "smooth" });
  }

  function closeRegistration() {
    setIsRegistering(false);
    syncUrl(false);
  }

  const isUnlimited = !safeEvent.capacity || safeEvent.capacity <= 0;
  const spotsLeft = isUnlimited ? 0 : Math.max(0, safeEvent.capacity - safeEvent.registeredCount);
  const fillPercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((safeEvent.registeredCount / safeEvent.capacity) * 100));

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background dolphin watermarks floating with scroll parallax */}
      <ParallaxDolphinWatermark
        className="absolute -right-8 sm:right-6 top-32 w-36 h-36 sm:w-48 sm:h-48 opacity-[0.08] mix-blend-multiply"
        speed={30}
        direction="down"
        initialRotate={20}
        flip={true}
      />
      <ParallaxDolphinWatermark
        className="absolute -left-10 sm:left-6 top-[55%] w-40 h-40 sm:w-52 sm:h-52 opacity-[0.07] mix-blend-multiply"
        speed={40}
        direction="up"
        initialRotate={-16}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Navigation link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to all events
        </Link>

        {/* ── Event Header Card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-10 md:p-12 shadow-warm-lg">
          {/* Subtle warm orange ambient aura */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                {event.category}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] font-semibold border",
                  isPast
                    ? "border-border/80 bg-muted/50 text-muted-foreground"
                    : "border-emerald-500/30 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                )}
              >
                {event.status}
              </span>
              {event.chapterName && (
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Chapter: {event.chapterName}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              {event.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-border/75 bg-muted/30 px-3.5 py-2 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/75 bg-muted/30 px-3.5 py-2 text-sm text-foreground">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/75 bg-muted/30 px-3.5 py-2 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Event Banner Image */}
        {safeEvent.bannerUrl && (
          <div className="mt-8 relative w-full h-[220px] sm:h-[320px] md:h-[400px] rounded-3xl overflow-hidden border border-border/80 shadow-warm">
            <SafeImage
              src={safeEvent.bannerUrl}
              alt={event.title}
              width={1200}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ── Main 2-Column Content Grid ── */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ── Left Column (Main Content or Registration Form) ── */}
          <div className="lg:col-span-8 space-y-8">
            {isRegistering ? (
              /* Inline Registration Form */
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-warm-lg">
                <div className="flex items-center justify-between border-b border-border/70 pb-5 mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Complete Registration
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Registering for <span className="font-medium text-foreground">{event.title}</span>
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={closeRegistration}>
                    ← Back to details
                  </Button>
                </div>
                <RegistrationForm event={safeEvent} />
              </div>
            ) : (
              <>
                {/* ── About This Event ── */}
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 shadow-warm">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    About this Event
                  </h2>

                  {event.description ? (
                    <div className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                      {event.description}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Join this session organized by Heapify Global Community to learn, collaborate,
                      and connect with fellow builders and developers.
                    </p>
                  )}
                </div>

                {/* ── Agenda ── */}
                {event.agenda && event.agenda.length > 0 && (
                  <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 shadow-warm">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-6">
                      Event Agenda
                    </h2>
                    <div className="space-y-3.5">
                      {event.agenda.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 rounded-2xl border border-border/70 bg-background/50 p-4 transition-all duration-200 hover:border-primary/30"
                        >
                          <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
                            {item.time}
                          </span>
                          <span className="text-sm font-medium text-foreground leading-snug">
                            {item.item || item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Speakers ── */}
                {event.speakers && event.speakers.length > 0 && (
                  <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 shadow-warm">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-6">
                      Featured Speakers
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {event.speakers.map((speaker, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/50 p-4.5 hover:border-primary/30 transition-all duration-200"
                        >
                          {speaker.photo_url ? (
                            <SafeImage
                              src={speaker.photo_url}
                              alt={speaker.name}
                              width={52}
                              height={52}
                              className="h-13 w-13 rounded-full shrink-0 object-cover border border-border/80"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0 text-primary font-display font-bold">
                              {speaker.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate">
                              {speaker.name}
                            </h3>
                            {speaker.role && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {speaker.role}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Column (Sticky Registration & Actions Sidebar) ── */}
          <div className="lg:col-span-4 sticky top-28 space-y-5">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-warm-lg relative overflow-hidden">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

              <h3 className="font-display text-xl font-bold text-foreground">
                Registration
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isPast
                  ? "This event has concluded."
                  : "Reserve your spot for this community experience."}
              </p>

              {/* Spots Left / Capacity Bar */}
              {!isPast && !isUnlimited && safeEvent.capacity > 0 && (
                <div className="mt-5 space-y-2 rounded-2xl border border-border/60 bg-background/60 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Spots remaining</span>
                    <span className="font-semibold text-primary">{spotsLeft} left</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                {isPast ? (
                  <div className="space-y-3">
                    <Button disabled className="w-full justify-center opacity-60 cursor-not-allowed">
                      Registration Closed
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      This event has already concluded.
                    </p>
                  </div>
                ) : isRegistering ? (
                  <Button variant="warm" className="w-full justify-center" onClick={closeRegistration}>
                    View event details
                  </Button>
                ) : (
                  <Button className="w-full justify-center text-base py-6 shadow-md" onClick={openRegistration}>
                    <Ticket className="mr-2 h-4 w-4" /> Register Now
                  </Button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  Free &amp; verified community access
                </div>

                {canExportRegistrations && (
                  <div className="border-t border-border/70 pt-4 mt-2">
                    <ExportRegistrationsButton slug={event.slug} />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Community Note Card */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 text-xs text-muted-foreground leading-relaxed shadow-sm">
              <span className="font-semibold text-foreground block mb-1">Heapify Community Access</span>
              Events are built by and for developers, designers, and creators. Connect with organizers and mentors across chapters.
            </div>
          </div>
        </div>

        {/* ── Related Events ── */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-border/70 pt-14">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
              More Events from Heapify
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
