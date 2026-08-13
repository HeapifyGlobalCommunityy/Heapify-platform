"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { brand, coreValues, timeline } from "@/lib/site-content";
import { FeatureCard, SectionWrapper } from "@/components/site/ui";

function TimelineItem({ item, index }: { item: { year: string; title: string; description: string }; index: number }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const isOdd = index % 2 === 1;

  // Track when the progress line hits this exact node
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start 85%", "start 55%"],
  });

  const cardOpacity = useTransform(scrollYProgress, [0, 0.75], [0, 1]);
  const cardY = useTransform(scrollYProgress, [0, 0.75], [35, 0]);
  const cardX = useTransform(scrollYProgress, [0, 0.75], [isOdd ? 30 : -30, 0]);

  const dotOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const dotScale = useTransform(scrollYProgress, [0, 1], [0.65, 1.15]);
  const dotGlow = useTransform(scrollYProgress, [0, 1], [
    "0px 0px 0px 0px rgba(255,122,0,0)",
    "0px 0px 20px 6px rgba(255,122,0,0.9)",
  ]);
  const dotBg = useTransform(scrollYProgress, [0, 1], [
    "rgba(255,255,255,0.25)",
    "rgba(255,122,0,1)",
  ]);

  return (
    <div
      ref={itemRef}
      className={`relative flex items-center justify-between md:justify-normal ${
        isOdd ? "md:flex-row-reverse" : ""
      } group`}
    >
      {/* Dot Container */}
      <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border border-glass-border bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
        <motion.div
          style={{
            opacity: dotOpacity,
            scale: dotScale,
            boxShadow: dotGlow,
            backgroundColor: dotBg,
          }}
          className="w-3 h-3 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_25px_rgba(255,122,0,1)]"
        />
      </div>

      {/* Card connected directly to scroll progress */}
      <motion.div
        style={{
          opacity: cardOpacity,
          y: cardY,
          x: cardX,
        }}
        className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-300 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
          {item.year}
        </span>
        <h3 className="mt-2 font-display text-xl font-semibold">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {item.description}
        </p>
      </motion.div>
    </div>
  );
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      <SectionWrapper
        eyebrow="Mission & Vision"
        title="We are building the operating system for global builders"
        description="A look into the community's core purpose, values, and the journey that brought us here."
        className="pt-40"
      >
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="rounded-[2rem] border border-glass-border bg-[linear-gradient(135deg,rgba(255,122,0,0.08),rgba(255,255,255,0.02))] p-10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(255,122,0,0.12)]">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">Mission</h3>
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-foreground/90">{brand.mission}</p>
          </div>
          <div className="rounded-[2rem] border border-glass-border bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(255,255,255,0.02))] p-10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400/40 hover:shadow-[0_12px_40px_rgba(59,130,246,0.12)]">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-blue-400">Vision</h3>
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-foreground/90">{brand.vision}</p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Core Values"
        title="The principles that guide our network"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, i) => (
            <FeatureCard
              key={value.title}
              eyebrow={`0${i + 1}`}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Timeline"
        title="Our journey so far"
        description="From a small local group to a distributed network of builders."
      >
        <div
          ref={containerRef}
          className="relative mt-12 max-w-4xl space-y-12 mx-auto"
        >
          {/* Background track line */}
          <div className="absolute top-0 bottom-0 ml-5 -translate-x-px md:left-1/2 md:ml-0 md:-translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Animated progress line with elegant glowing tip */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 ml-5 -translate-x-px md:left-1/2 md:ml-0 md:-translate-x-1/2 w-[2px] bg-gradient-to-b from-primary/10 via-primary/60 to-primary origin-top z-0"
          >
            {/* Elegant Glowing Tip */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full z-20 shadow-[0_0_12px_3px_rgba(255,122,0,0.8)]">
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white rounded-full shadow-[0_0_20px_5px_rgba(255,122,0,0.6)]"
              />
            </div>
          </motion.div>

          {timeline.map((item, index) => (
            <TimelineItem key={item.title} item={item} index={index} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
