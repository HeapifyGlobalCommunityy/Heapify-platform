"use client";

import { motion } from "framer-motion";
import { CTAComponent, SectionWrapper } from "@/components/site/ui";
import { cn } from "@/lib/utils";

const leaders = [
  { rank: "01", name: "Aanya Rao", metric: "12.8k pts", role: "Founder", change: "+12%" },
  { rank: "02", name: "Mika Chen", metric: "11.1k pts", role: "Co-Founder", change: "+8%" },
  { rank: "03", name: "Jordan Vega", metric: "9.4k pts", role: "Community Lead", change: "+15%" },
  { rank: "04", name: "Riya Nair", metric: "8.2k pts", role: "Mentor", change: "+4%" },
  { rank: "05", name: "Alex Torres", metric: "7.9k pts", role: "Core Contributor", change: "+2%" },
  { rank: "06", name: "Samira Patel", metric: "7.1k pts", role: "Chapter Lead", change: "+18%" },
];

export default function LeaderboardPage() {
  return (
    <>
      <SectionWrapper eyebrow="Leaderboard" title="Global Rankings" description="Contribution rankings with a premium data feel. A future-ready leaderboard that can later reflect real community metrics." className="pt-36 pb-12">
        <div className="mt-8 space-y-3">
          {leaders.map((leader, index) => {
            const isTop3 = index < 3;
            return (
              <motion.div 
                key={leader.rank} 
                initial={{ opacity: 0, x: -10 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, amount: 0.8 }} 
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className={cn(
                  "flex items-center justify-between rounded-[1.25rem] border p-5 transition-colors backdrop-blur-xl",
                  isTop3 ? "border-primary/30 bg-primary/[0.03]" : "border-glass-border bg-glass-bg hover:bg-glass-bg"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn("font-mono text-lg font-medium", isTop3 ? "text-primary" : "text-muted-foreground")}>{leader.rank}</div>
                  <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_70%)] border border-glass-border" />
                  <div>
                    <div className="font-display text-lg font-semibold tracking-tight">{leader.name}</div>
                    <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mt-1">{leader.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-semibold tracking-tight">{leader.metric}</div>
                  <div className="text-xs font-medium text-green-400 mt-1">{leader.change}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Real metrics can replace this mock ranking later without changing the layout."
        description="The current structure already feels like a product leaderboard rather than a simple list."
        actions={[
          { label: "Open dashboard", href: "/dashboard" },
          { label: "Join community", href: "/forms/join", variant: "ghost" },
        ]}
      />
    </>
  );
}
