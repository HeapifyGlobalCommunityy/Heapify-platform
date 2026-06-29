"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EventCard, SectionWrapper } from "@/components/site/ui";

// Minimal type matching what page.tsx passes
interface AgendaItem { time: string; item: string; }
interface Speaker { name: string; role: string; }

interface Props {
  event: {
    slug: string;
    title: string;
    category: string;
    status: string;
    date: string;
    time: string;
    location: string;
    banner?: string;
    agenda?: AgendaItem[];
    speakers?: Speaker[];
  };
  slug: string;
  related: { slug: string; title: string; category: string; status: string; date: string; time: string; location: string; [key: string]: string }[];
  isPast: boolean;
}

// Shared hover variant – slight lift + faint glow
const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.008, transition: { duration: 0.2, ease: "easeOut" } },
};

// The orange-glow diffusion variant used only on the hero title card
const heroDiffuse = {
  rest: { backgroundPosition: "0% 50%", opacity: 1 },
  hover: { backgroundPosition: "100% 50%", opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function EventDetailClient({ event, slug, related, isPast }: Props) {
  return (
    <article className="pt-32">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>

        {/* ─── Hero Banner with colour-diffusion glow on hover ─── */}
        <motion.div
          initial="rest"
          whileHover="hover"
          animate="rest"
          className="group mt-8 rounded-[2rem] border border-glass-border relative overflow-hidden cursor-default
            bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(10,10,10,0.8))]
            p-10 backdrop-blur-xl"
        >
          {/* Static ambient glow */}
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
          </div>

          {/* Hover diffusion glow — expands on hover */}
          <motion.div
            variants={{
              rest: { opacity: 0, scale: 0.7 },
              hover: { opacity: 1, scale: 1.5, transition: { duration: 0.7, ease: "easeInOut" } },
            }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,122,0,0.18),transparent_60%)] pointer-events-none"
          />

          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-[0.28em] text-primary">
              {event.category} • {event.status}
            </div>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-glass-bg">
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
        </motion.div>
      </div>

      {/* ─── Content + Sidebar ─── */}
      <div className="mx-auto max-w-4xl px-6 py-16 grid gap-12 md:grid-cols-3">
        {/* Left: agenda + speakers */}
        <div className="md:col-span-2 space-y-12">
          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Agenda</h2>
              <div className="mt-6 space-y-4">
                {event.agenda.map((item, i) => (
                  <motion.div
                    key={i}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    variants={cardHover}
                    className="flex gap-6 rounded-2xl border border-glass-border bg-glass-bg p-5 cursor-default"
                  >
                    <div className="font-mono text-sm text-primary/80 shrink-0">{item.time}</div>
                    <div className="text-sm text-foreground/90">{item.item}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Speakers</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {event.speakers.map((speaker, i) => (
                  <motion.div
                    key={i}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    variants={cardHover}
                    className="flex items-center gap-4 rounded-2xl border border-glass-border bg-glass-bg p-5 cursor-default"
                  >
                    <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{speaker.name}</div>
                      <div className="text-xs text-muted-foreground">{speaker.role}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Registration Card (NOT sticky — inline in the flow) ─── */}
        <div>
          <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={cardHover}
            className="rounded-3xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl cursor-default"
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
                <Button asChild className="w-full justify-center">
                  <Link href={`/events/${slug}?register=true`} scroll={false}>
                    <Ticket className="mr-2 h-4 w-4" /> Register now
                  </Link>
                </Button>
              )}
              <div className="text-center text-xs text-muted-foreground mt-2">
                Registration is managed securely.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Related Events ─── */}
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
