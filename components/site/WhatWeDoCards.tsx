"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  BookOpen,
  GitBranch,
  Users,
  Briefcase,
  Sparkles,
  LucideIcon,
} from "lucide-react";

interface WhatWeDoItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const ITEMS: WhatWeDoItem[] = [
  {
    id: "01",
    title: "HACKATHONS & CHALLENGES",
    description:
      "We organize hackathons and technical challenges that give builders a platform to turn ideas into working solutions.",
    icon: Trophy,
  },
  {
    id: "02",
    title: "TECHNICAL LEARNING",
    description:
      "Workshops, technical sessions, builder talks, and practical learning experiences focused on real-world technologies.",
    icon: BookOpen,
  },
  {
    id: "03",
    title: "OPEN SOURCE",
    description:
      "We encourage developers to contribute, collaborate, and build in the open through open-source initiatives and community projects.",
    icon: GitBranch,
  },
  {
    id: "04",
    title: "BUILDER COMMUNITY",
    description:
      "A network where students and developers can find collaborators, exchange ideas, and build alongside other motivated people.",
    icon: Users,
  },
  {
    id: "05",
    title: "CAREER & OPPORTUNITIES",
    description:
      "Connecting builders with opportunities to learn, showcase their work, collaborate with organizations, and grow professionally.",
    icon: Briefcase,
  },
  {
    id: "06",
    title: "AI & EMERGING TECHNOLOGY",
    description:
      "A strong focus on AI, GenAI, developer tools, and emerging technologies through hands-on projects and events.",
    icon: Sparkles,
  },
];

export function WhatWeDoCards() {
  return (
    <section
      className="relative px-4 py-14 sm:px-6 md:py-24 overflow-hidden"
      id="what-we-do"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.28em] text-[#ff7a00] font-bold mb-2">
              WHAT WE DO
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground font-display">
              A Community Built Around Action
            </h2>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed">
              Everything Heapify does is about builders — people who learn, ship, and create.
            </p>
          </motion.div>
        </div>

        {/* 3x2 Grid with Light Grey Cards & Big Bold Typography */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-[#F4F5F7] dark:bg-[#18181b] p-7 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_-8px_rgba(255,87,34,0.18)] hover:border-orange-500/60 dark:hover:border-orange-500/50 transition-all duration-300"
              >
                <div>
                  {/* Header: Orange Icon + Orange Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/25 dark:border-orange-500/30 text-[#FF5722] dark:text-[#ff7a00] group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-[18px] font-black uppercase tracking-wide text-[#FF5722] dark:text-[#ff7a00] font-display leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description with Larger Font Size */}
                  <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-zinc-300 font-normal">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
