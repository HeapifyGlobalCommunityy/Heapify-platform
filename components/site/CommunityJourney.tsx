"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function CommunityJourney() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "center 45%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Parallax shifts for background concentric rings
  const ringRotateLeft = useTransform(smoothProgress, [0, 1], [-8, 12]);
  const ringRotateRight = useTransform(smoothProgress, [0, 1], [8, -12]);
  const ringScale = useTransform(smoothProgress, [0, 1], [0.94, 1.05]);

  const steps = [
    {
      step: "01",
      title: "Discover",
      description: "Join hackathons, tech sessions, and community events.",
      icon: (
        <Image
          src="/discover-icon.png"
          alt="Discover"
          width={112}
          height={112}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
        />
      ),
    },
    {
      step: "02",
      title: "Learn",
      description: "Learn directly from mentors and hands-on workshops.",
      icon: (
        <Image
          src="/learn-icon.png"
          alt="Learn"
          width={112}
          height={112}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
        />
      ),
    },
    {
      step: "03",
      title: "Build",
      description: "Turn ideas into real projects, collaborate, and ship.",
      icon: (
        <Image
          src="/build-icon.png"
          alt="Build"
          width={112}
          height={112}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
        />
      ),
    },
    {
      step: "04",
      title: "Lead",
      description: "Grow into a mentor, organizer, or chapter leader.",
      icon: (
        <Image
          src="/lead-icon.png"
          alt="Lead"
          width={112}
          height={112}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
        />
      ),
    },
  ];

  return (
    <section ref={containerRef} className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <div className="w-full rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#FF5722] via-[#FF6735] to-[#FF7A45] dark:from-[#E64A19] dark:via-[#D84315] dark:to-[#BF360C] pt-7 pb-8 md:pt-9 md:pb-10 px-5 sm:px-8 md:px-10 relative overflow-hidden shadow-[0_20px_50px_-15px_rgba(255,87,34,0.35)]">
        {/* Subtle decorative concentric circle accents with scroll parallax */}
        <motion.div
          style={{ rotate: ringRotateLeft, scale: ringScale, willChange: "transform" }}
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full border border-white/20 pointer-events-none"
        />
        <motion.div
          style={{ rotate: ringRotateLeft, willChange: "transform" }}
          className="absolute -left-10 -top-10 w-64 h-64 rounded-full border border-white/15 pointer-events-none"
        />
        <motion.div
          style={{ rotate: ringRotateRight, scale: ringScale, willChange: "transform" }}
          className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-white/20 pointer-events-none"
        />
        <motion.div
          style={{ rotate: ringRotateRight, willChange: "transform" }}
          className="absolute -right-12 -bottom-12 w-72 h-72 rounded-full border border-white/15 pointer-events-none"
        />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[1220px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 md:mb-6 px-1 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-display mb-1.5 drop-shadow-sm">
              Community Journey
            </h2>
            <p className="text-white/95 text-base sm:text-lg font-medium max-w-2xl mx-auto">
              From discovery to leadership.
            </p>
            <p className="text-white/80 text-xs sm:text-sm mt-0.5 max-w-2xl mx-auto">
              The path every Heapify builder takes — from first event to community leader.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45, type: "spring", stiffness: 110 }}
                className="rounded-2xl p-5 sm:p-6 md:p-7 flex flex-col items-center text-center relative"
              >

                <div className="flex flex-col items-center w-full mt-1">
                  {/* Icon Container */}
                  <div className="relative mb-2 flex items-center justify-center">
                    {step.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                      {step.title}
                    </h3>

                    <p className="text-white/85 text-xs sm:text-[13px] leading-relaxed max-w-[210px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
