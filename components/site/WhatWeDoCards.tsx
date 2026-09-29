"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WhatWeDoItem {
  id: string;
  number: string;
  title: string;
  description: string;
  ringBorder: string;
  ringBg: string;
  icon: React.ReactNode;
}

const ITEMS: WhatWeDoItem[] = [
  {
    id: "01",
    number: "01",
    title: "HACKATHONS & CHALLENGES",
    description: "We organize hackathons and technical challenges that give builders a platform to turn ideas into working solutions.",
    ringBorder: "border-orange-400 text-orange-500",
    ringBg: "bg-orange-50/80 dark:bg-orange-950/30",
    icon: <img src="/hackathons.png" alt="Hackathons & Challenges" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md" />,
  },
  {
    id: "02",
    number: "02",
    title: "TECHNICAL LEARNING",
    description: "Workshops, technical sessions, builder talks, and practical learning experiences focused on real-world technologies.",
    ringBorder: "border-emerald-500 text-emerald-600",
    ringBg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    icon: <img src="/technical-learning.png" alt="Technical Learning" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md" />,
  },
  {
    id: "03",
    number: "03",
    title: "OPEN SOURCE",
    description: "We encourage developers to contribute, collaborate, and build in the open through open-source initiatives and community projects.",
    ringBorder: "border-cyan-500 text-cyan-600",
    ringBg: "bg-cyan-50/80 dark:bg-cyan-950/30",
    icon: <img src="/open-source.png" alt="Open Source" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md" />,
  },
  {
    id: "04",
    number: "04",
    title: "BUILDER COMMUNITY",
    description: "A network where students and developers can find collaborators, exchange ideas, and build alongside other motivated people.",
    ringBorder: "border-indigo-400 text-indigo-500",
    ringBg: "bg-indigo-50/80 dark:bg-indigo-950/30",
    icon: <img src="/community.png" alt="Builder Community" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md mix-blend-multiply dark:mix-blend-normal" />,
  },
  {
    id: "05",
    number: "05",
    title: "CAREER & OPPORTUNITIES",
    description: "Connecting builders with opportunities to learn, showcase their work, collaborate with organizations, and grow professionally.",
    ringBorder: "border-rose-400 text-rose-500",
    ringBg: "bg-rose-50/80 dark:bg-rose-950/30",
    icon: <img src="/career.png" alt="Career & Opportunities" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md mix-blend-multiply dark:mix-blend-normal" />,
  },
  {
    id: "06",
    number: "06",
    title: "AI & EMERGING TECHNOLOGY",
    description: "A strong focus on AI, GenAI, developer tools, and emerging technologies through hands-on projects and events.",
    ringBorder: "border-amber-500 text-amber-600",
    ringBg: "bg-amber-50/80 dark:bg-amber-950/30",
    icon: <img src="/ai-technology.png" alt="AI & Emerging Technology" className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md" />,
  },
];

// Duplicate items heavily to create a massive array (180 items) for true continuous scroll
const INFINITE_ITEMS = Array(30).fill(ITEMS).flat();

export function WhatWeDoCards() {
  const [startIndex, setStartIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(380); // Default card width in pixels
  const gap = 24; // 24px gap (gap-6)
  const trackRef = useRef<HTMLDivElement>(null);

  // Measure screen width to adjust fixed card width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardWidth(300);
      } else if (window.innerWidth < 1024) {
        setCardWidth(340);
      } else {
        setCardWidth(380); // Fixed size for desktop so it NEVER stretches
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = useCallback(() => {
    setStartIndex((prev) => {
      if (prev >= INFINITE_ITEMS.length - 3) return 0;
      return prev + 1;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setStartIndex((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  }, []);

  // Auto-scroll every 3 seconds reliably
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <section
      className="relative px-4 py-16 sm:px-6 md:py-24 bg-gradient-to-b from-[#FFFDF9]/80 via-[#FFF9F2] to-[#FFF5E9]/90 dark:from-transparent dark:via-transparent dark:to-transparent overflow-hidden"
      id="what-we-do"
    >
      {/* City skyline watermark backdrop */}
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 280" fill="none" className="w-full h-full text-orange-400/30">
          <path
            fill="currentColor"
            d="M0 280V210h25v-25h15v25h35v-50h25v50h40v-35h20v35h60v-70h15v-20h8v20h15v70h55v-40h30v-30h25v30h20v40h70v-60h22v60h50v-85h12v-25h6v25h12v85h65v-45h30v45h80v-65h25v65h45v-30h35v30h60v-80h20v-25h10v25h20v80h75v-55h25v55h65v-45h35v45h80v-75h18v-15h8v15h18v75h90v-35h35v35h60v-60h25v60h105V280H0z"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-[1400px]">
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#ff7a00] drop-shadow-sm font-display uppercase">
              WHAT WE DO
            </h2>
            <p className="mt-3 text-base sm:text-lg md:text-xl text-[#0B2545] dark:text-zinc-200 font-bold max-w-2xl mx-auto">
              A Community Built Around Action
            </p>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal max-w-xl mx-auto">
              Everything Heapify does is about builders — people who learn, ship, and create.
            </p>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-orange-500" />
          </motion.div>
        </div>

        {/* Carousel Container with Left/Right Navigation Arrows */}
        <div className="relative px-2 sm:px-12 md:px-16">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous"
            className="absolute -left-2 sm:left-1 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-orange-500 bg-white/95 dark:bg-zinc-900/90 text-orange-500 shadow-md hover:bg-orange-500 hover:text-white transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            aria-label="Next"
            className="absolute -right-2 sm:right-1 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-orange-500 bg-white/95 dark:bg-zinc-900/90 text-orange-500 shadow-md hover:bg-orange-500 hover:text-white transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Smooth Sliding Track perfectly sized to show exactly 3 cards */}
          <div
            className="overflow-hidden mx-auto py-8 px-2"
            style={{
              maxWidth: (cardWidth * 3) + (gap * 2) + 32, // +32 for padding
            }}
          >
            <motion.div
              ref={trackRef}
              className="flex gap-6 w-max"
              animate={{
                // Calculate exact pixel translation based on fixed card width + gap
                x: -(startIndex * (cardWidth + gap)),
              }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 1.2, // Slower, highly smooth sliding animation
              }}
            >
              {INFINITE_ITEMS.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  style={{ width: cardWidth }}
                  className="shrink-0 group relative flex flex-col justify-between rounded-xl border-2 border-orange-400/80 hover:border-orange-500 dark:border-zinc-800 dark:hover:border-orange-500/50 bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF6] to-[#FFF7ED] dark:from-[#141416] dark:via-[#111113] dark:to-[#0d0d0f] p-6 sm:p-7 sm:px-9 text-center transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(255,122,0,0.12)] hover:shadow-[0_20px_45px_-12px_rgba(255,122,0,0.25)] h-[400px]"
                >
                  <div className="flex flex-col items-center flex-grow">
                    {/* Top Circular Badge with Icon */}
                    <div
                      className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-[2.5px] ${item.ringBorder} ${item.ringBg} p-2 shadow-inner transition-transform duration-300 group-hover:scale-105`}
                    >
                      {item.icon}
                    </div>

                    {/* Bold Navy Blue Title */}
                    <h3 className="mt-6 text-lg sm:text-xl font-black tracking-tight text-[#0B2545] dark:text-zinc-100 font-display line-clamp-2 min-h-[56px] flex items-center justify-center">
                      {item.title}
                    </h3>

                    {/* Exact Description Provided */}
                    <p className="mt-3.5 text-sm leading-relaxed text-[#0B2545]/75 dark:text-zinc-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
