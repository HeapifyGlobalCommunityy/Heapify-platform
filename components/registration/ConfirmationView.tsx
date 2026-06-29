"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  event: {
    title: string;
    date: string;
    slug: string;
  };
  teamName?: string;
  totalMembers?: number;
  isTeamEvent: boolean;
}

export default function ConfirmationView({ event, teamName, totalMembers, isTeamEvent }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16 space-y-10 relative">
      {/* Subtle orange glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[4000ms]" />

      {/* Success Animation Ring */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_30px_rgba(255,122,0,0.2)]"
        >
          <svg
            className="h-9 w-9 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        {/* Spark particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x = Math.cos(angle) * 45;
          const y = Math.sin(angle) * 45;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{ scale: [0, 1.2, 0], x, y, opacity: [1, 1, 0] }}
              transition={{ delay: 0.45, duration: 0.65, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-primary rounded-full"
              style={{ marginLeft: "-3px", marginTop: "-3px" }}
            />
          );
        })}
      </div>

      {/* Main Success Text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Seat Secured!
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto font-sans leading-relaxed">
          Your application for{" "}
          <span className="text-white font-medium">{event.title}</span> has been received
          successfully.
        </p>
      </motion.div>

      {/* Ticket Pass Receipt */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.25 }}
        className="w-full max-w-sm rounded-[2rem] border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        {/* Ticket cutout notches */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0A0A0B] rounded-r-full border-r border-zinc-800" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0A0A0B] rounded-l-full border-l border-zinc-800" />

        <div className="space-y-4 text-left">
          {/* Header */}
          <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            <span>Heapify Global Pass</span>
            <span className="text-primary font-medium">Confirmed</span>
          </div>

          <div className="h-px bg-zinc-800 mt-2" />

          {/* Ticket Info */}
          <div className="space-y-3 pt-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500">Event</span>
              <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500">Date</span>
                <p className="text-xs font-medium text-white">{event.date}</p>
              </div>
              {isTeamEvent && teamName ? (
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Team</span>
                  <p className="text-xs font-medium text-white truncate">{teamName}</p>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Attendees</span>
                  <p className="text-xs font-medium text-white">
                    {totalMembers
                      ? `${totalMembers} builder${totalMembers !== 1 ? "s" : ""}`
                      : "1 builder"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-800 mt-4" />

          {/* Barcode */}
          <div className="pt-2 flex flex-col items-center space-y-1.5 opacity-40">
            <div className="flex justify-center items-end h-8 w-full gap-[2px]">
              {Array.from({ length: 28 }).map((_, i) => {
                const heights = ["h-6", "h-7", "h-8", "h-5"];
                const h = heights[i % 4];
                const widths = ["w-[1px]", "w-[2px]", "w-[3px]"];
                const w = widths[(i * 7) % 3];
                return <div key={i} className={`${h} ${w} bg-white shrink-0`} />;
              })}
            </div>
            <span className="text-[9px] font-mono tracking-widest text-zinc-600">
              HEAPIFY · {event.slug.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      >
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black text-sm font-semibold hover:brightness-110 shadow-lg shadow-primary/20 transition-all duration-150 font-sans"
        >
          Explore Events <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}
