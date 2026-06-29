"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

interface TeamConfig {
  minSize: number;
  maxSize: number;
  allowSolo: boolean;
}

interface CustomQuestion {
  id: string;
  label: string;
  type: "select" | "text" | "textarea";
  options?: string[];
  required: boolean;
}

interface EventSummaryProps {
  event: {
    title: string;
    slug: string;
    category: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    registeredCount: number;
    bannerUrl: string | null;
    teamConfig: TeamConfig | null;
    customQuestions: CustomQuestion[];
  };
}

export default function EventSummaryPanel({ event }: EventSummaryProps) {
  const [barWidth, setBarWidth] = useState(0);
  const spotsLeft = event.capacity - event.registeredCount;
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(fillPercent), 120);
    return () => clearTimeout(t);
  }, [fillPercent]);

  return (
    <aside className="lg:w-[40%] lg:h-full lg:overflow-y-auto lg:border-r lg:border-zinc-800 shrink-0">
      <div className="p-6 lg:p-8 pt-8 lg:pt-10 pb-12 space-y-6">

        {/* Back link — wrapped in a block element to prevent any inline wrapping/intersection */}
        <div className="block">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to event
          </Link>
        </div>

        {/* Category pill */}
        <div className="inline-flex">
          <span className="border border-primary/40 text-primary text-[10px] font-mono uppercase tracking-[0.28em] px-2.5 py-1 rounded-md">
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white line-clamp-2 leading-tight">
          {event.title}
        </h2>

        {/* Date + Time */}
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4 text-zinc-600 shrink-0" />
          <span>{event.date} · {event.time}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MapPin className="h-4 w-4 text-zinc-600 shrink-0" />
          <span>{event.location}</span>
        </div>

        {/* Capacity bar — w-full and proper spacing */}
        <div className="w-full space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-400">Spots available</span>
            <span className="font-mono text-sm text-white">
              <span className={spotsLeft <= 10 ? "text-primary font-bold" : ""}>{spotsLeft}</span>
              <span className="text-zinc-600">&nbsp;/&nbsp;{event.capacity}</span>
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

        {/* Team info pill */}
        {event.teamConfig && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-500 font-mono">
            Team event · {event.teamConfig.minSize}–{event.teamConfig.maxSize} members
            {event.teamConfig.allowSolo && " · Solo allowed"}
          </div>
        )}

        {/* Organizer */}
        <div className="pt-2 flex items-center gap-3 border-t border-zinc-800">
          <div className="w-7 h-7 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-display font-semibold text-primary">H</span>
          </div>
          <span className="text-xs text-zinc-500">Heapify Global Community</span>
        </div>
      </div>
    </aside>
  );
}
