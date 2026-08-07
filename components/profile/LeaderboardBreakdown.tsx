"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  category: string;
  score: number;
  period: string;
}

interface LeaderboardBreakdownProps {
  entries: LeaderboardEntry[];
}

const CATEGORIES = [
  { id: "event_participation", label: "Event Participation" },
  { id: "contributors", label: "Open Source" },
  { id: "mentors", label: "Mentorship" },
  { id: "community_champions", label: "Community Champion" },
];

export function LeaderboardBreakdown({ entries }: LeaderboardBreakdownProps) {
  const [period, setPeriod] = useState<"all_time" | "monthly">("all_time");

  // Filter entries based on selected period
  const filteredEntries = entries.filter((e) => e.period === period);

  // Group by category to find score for each
  const categoryScores = CATEGORIES.map((cat) => {
    const matched = filteredEntries.find((e) => e.category === cat.id);
    return {
      id: cat.id,
      label: cat.label,
      score: matched ? matched.score : 0,
    };
  });

  // Calculate sum of scores for this period to represent progress percentages
  const periodTotal = categoryScores.reduce((sum, item) => sum + item.score, 0);

  return (
    <div className="mt-6 rounded-2xl border border-glass-border bg-glass-bg/30 p-5 text-left">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Score Breakdown
        </h4>
        {/* Toggle tabs */}
        <div className="flex rounded-lg border border-glass-border p-0.5 bg-glass-bg/50">
          <button
            onClick={() => setPeriod("all_time")}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-semibold transition-all",
              period === "all_time"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All-Time
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-semibold transition-all",
              period === "monthly"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {categoryScores.map((cat) => {
          const percentage = periodTotal > 0 ? (cat.score / periodTotal) * 100 : 0;
          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">{cat.label}</span>
                <span className="font-semibold text-foreground font-mono">{cat.score} pts</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
