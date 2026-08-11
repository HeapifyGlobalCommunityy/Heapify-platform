"use client";

import { motion } from "framer-motion";
import { socialChannels } from "@/lib/site-content";
import { SectionWrapper } from "@/components/site/ui";
import {
  ArrowUpRight,
  Sparkles,
  Users,
  MessageSquare,
} from "lucide-react";

// High-fidelity brand logo SVGs for premium display
const iconMap: Record<string, React.ReactNode> = {
  WhatsApp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-emerald-500">
      <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.975L2 22l5.241-1.373a9.921 9.921 0 0 0 4.771 1.22c5.506 0 9.99-4.484 9.99-9.99 0-2.658-1.037-5.16-2.92-7.047C17.172 3.033 14.67 2 12.012 2zM12 4c2.138 0 4.148.832 5.66 2.344a7.94 7.94 0 0 1 2.34 5.656c0 4.41-3.59 8-8 8a7.95 7.95 0 0 1-4.062-1.111l-.292-.174-3.02.791.805-2.943-.191-.303A7.952 7.952 0 0 1 4 12c0-4.41 3.59-8 8-8zm-2.484 4.542c-.145-.32-.298-.328-.438-.334l-.372-.008c-.128 0-.336.048-.512.24-.176.192-.672.656-.672 1.6s.688 1.856.784 2c.096.144 1.353 2.067 3.28 2.898.458.198.816.316 1.096.406.46.146.88.125 1.212.076.37-.056 1.139-.465 1.3-.913.16-.448.16-.833.112-.913-.048-.08-.176-.128-.368-.224-.192-.096-1.139-.562-1.315-.626-.176-.064-.304-.096-.432.096-.128.192-.496.626-.608.754-.112.128-.224.144-.416.048-.192-.096-.81-.299-1.543-.953-.57-.508-.954-1.137-1.066-1.329-.112-.192-.012-.296.084-.391.087-.086.192-.224.288-.336.096-.112.128-.192.192-.32.064-.128.032-.24-.016-.336-.048-.096-.438-1.056-.601-1.448z"/>
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-pink-500">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  "Twitter / X": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-zinc-100">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-blue-500">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
};

const gradientMap: Record<string, string> = {
  WhatsApp: "from-emerald-500/10 via-transparent to-transparent",
  Instagram: "from-pink-500/10 via-transparent to-transparent",
  "Twitter / X": "from-zinc-500/10 via-transparent to-transparent",
  LinkedIn: "from-blue-500/10 via-transparent to-transparent",
};

const hoverBorderMap: Record<string, string> = {
  WhatsApp: "hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]",
  Instagram: "hover:border-pink-500/30 hover:shadow-[0_8px_30px_rgba(236,72,153,0.1)]",
  "Twitter / X": "hover:border-zinc-500/30 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]",
  LinkedIn: "hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]",
};

export default function SocialHubPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Social Page Hero Banner */}
      <SectionWrapper
        title="Connect & Collaborate"
        eyebrow="Social Hub"
        description="Join our global builder network across all developer ecosystems. We build in public and sync asynchronously."
        className="pt-40 pb-10"
      >
        {/* Quick Stats Ribbon */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 max-w-4xl mt-6">
          <div className="rounded-2xl border border-glass-border bg-glass-bg p-5 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-primary text-sm font-mono uppercase tracking-wider">
              <Users className="h-4 w-4" /> Global Builders
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">1,200+ Members</div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-glass-bg p-5 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-primary text-sm font-mono uppercase tracking-wider">
              <MessageSquare className="h-4 w-4" /> Daily Active Talks
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">Async Discussions</div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-glass-bg p-5 backdrop-blur-md col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 text-primary text-sm font-mono uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Platform Scope
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">4 Core Networks</div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-5xl">
          {socialChannels.map((channel, index) => (
            <motion.a
              key={channel.title}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.005 }}
              className={`group relative block rounded-[2rem] border border-glass-border bg-glass-bg p-8 backdrop-blur-xl transition-all duration-300 ${hoverBorderMap[channel.title] || "hover:border-primary/30"}`}
            >
              {/* Corner Ambient Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[channel.title] || "from-primary/10"} to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]`} />

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass-border bg-muted/40 group-hover:scale-105 transition-transform duration-300">
                    {iconMap[channel.title] || <Sparkles className="h-7 w-7 text-primary" />}
                  </div>
                  
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-muted/30 text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {channel.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                    {channel.description}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                    Open Community Channel &rarr;
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
