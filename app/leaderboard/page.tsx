"use client";

import { motion } from "framer-motion";
import { CTAComponent, SectionWrapper } from "@/components/site/ui";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";
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
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Background dolphin watermarks */}
      <ParallaxDolphinWatermark
        className="absolute -right-8 sm:right-6 top-32 w-36 h-36 sm:w-48 sm:h-48 opacity-[0.08] mix-blend-multiply"
        speed={30}
        direction="down"
        initialRotate={18}
        flip={true}
      />
      <ParallaxDolphinWatermark
        className="absolute -left-10 sm:left-6 top-[55%] w-40 h-40 sm:w-52 sm:h-52 opacity-[0.07] mix-blend-multiply"
        speed={40}
        direction="up"
        initialRotate={-16}
      />

      <SectionWrapper eyebrow="Leaderboard" title="Global Rankings" description="Contribution rankings with a premium data feel. A future-ready leaderboard that can later reflect real community metrics." className="pt-28 sm:pt-36 pb-12">
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
                  isTop3 ? "border-primary/30 bg-primary/[0.03]" : "border-border/80 bg-card hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn("font-mono text-lg font-medium", isTop3 ? "text-primary" : "text-muted-foreground")}>{leader.rank}</div>
                  <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_70%)] border border-border/80" />
                  <div>
                    <div className="font-display text-lg font-semibold tracking-tight">{leader.name}</div>
                    <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mt-1">{leader.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-semibold tracking-tight">{leader.metric}</div>
                  <div className="text-xs font-medium text-green-500 mt-1">{leader.change}</div>
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
          { label: "Join community", href: "/forms", variant: "ghost" },
        ]}
      />
    </div>
  );
}
