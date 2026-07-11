"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Trophy, CalendarDays, Briefcase, BadgeCheck } from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { DEFAULT_DEMO_PROFILE, readDemoProfile, saveDemoProfile, type DemoProfile } from "@/lib/demo-profile";

const statCards = [
  { label: "Contribution Score", value: "92/100", icon: Trophy },
  { label: "Events Attended", value: "18", icon: CalendarDays },
  { label: "Projects Shipped", value: "7", icon: Briefcase },
  { label: "Certificates", value: "4", icon: BadgeCheck },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<DemoProfile | null>(null);

  useEffect(() => {
    const current = readDemoProfile() ?? DEFAULT_DEMO_PROFILE;
    saveDemoProfile(current);
    setProfile(current);
  }, []);

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SectionWrapper eyebrow="Profile" title="Local demo profile" description="A fallback profile view that works without Supabase access on this machine." className="pt-36">
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl rounded-[2rem] border border-glass-border bg-glass-bg/80 p-8 shadow-[0_30px_100px_-40px_rgba(255,122,0,0.35)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary">Member</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{profile.fullName}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
                {profile.role}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-glass-border bg-background/70 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                About
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{profile.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-glass-border px-3 py-1">@{profile.username}</span>
                <span className="rounded-full border border-glass-border px-3 py-1">{profile.chapter}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm text-foreground transition hover:bg-glass-border">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </div>
          </motion.div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[1.5rem] border border-glass-border bg-glass-bg/70 p-6 shadow-[0_20px_80px_-40px_rgba(255,122,0,0.3)]"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {card.label}
                  </div>
                  <div className="mt-4 font-display text-3xl font-semibold tracking-tight">{card.value}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
