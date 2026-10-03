"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { brand, coreValues, timeline } from "@/lib/site-content";
import { FeatureCard, SectionWrapper } from "@/components/site/ui";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";

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
    "rgba(148,163,184,0.3)",
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
      <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border border-border/80 bg-card shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
        <motion.div
          style={{
            opacity: dotOpacity,
            scale: dotScale,
            boxShadow: dotGlow,
            backgroundColor: dotBg,
          }}
          className="w-3.5 h-3.5 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_25px_rgba(255,122,0,1)]"
        />
      </div>

      {/* Card connected directly to scroll progress */}
      <motion.div
        style={{
          opacity: cardOpacity,
          y: cardY,
          x: cardX,
        }}
        className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 sm:p-7 rounded-3xl border border-border/75 bg-card hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-300 shadow-warm"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          {item.year}
        </span>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
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
    <div className="relative overflow-hidden">
      {/* Background dolphin watermarks */}
      <ParallaxDolphinWatermark
        className="absolute -right-8 sm:right-6 top-24 w-36 h-36 sm:w-48 sm:h-48 opacity-[0.08] mix-blend-multiply"
        speed={30}
        direction="down"
        initialRotate={18}
        flip={true}
      />
      <ParallaxDolphinWatermark
        className="absolute -left-10 sm:left-6 top-[45%] w-40 h-40 sm:w-52 sm:h-52 opacity-[0.07] mix-blend-multiply"
        speed={40}
        direction="up"
        initialRotate={-16}
      />
      <ParallaxDolphinWatermark
        className="absolute -right-8 sm:right-8 top-[80%] w-36 h-36 sm:w-44 sm:h-44 opacity-[0.07] mix-blend-multiply"
        speed={25}
        direction="down"
        initialRotate={12}
      />

      <SectionWrapper
        eyebrow="Mission & Vision"
        title="We are building the operating system for global builders"
        description="A look into the community's core purpose, values, and the journey that brought us here."
        className="pt-10 sm:pt-14"
      >
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Mission Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-warm hover:border-primary/40 hover:shadow-orange hover:-translate-y-1 transition-all duration-300">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <h3 className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] text-primary font-semibold">
              Mission
            </h3>
            <p className="mt-5 font-display text-2xl sm:text-3xl font-500 leading-relaxed text-foreground/90">
              {brand.mission}
            </p>
          </div>

          {/* Vision Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-warm hover:border-primary/40 hover:shadow-orange hover:-translate-y-1 transition-all duration-300">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <h3 className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] text-primary font-semibold">
              Vision
            </h3>
            <p className="mt-5 font-display text-2xl sm:text-3xl font-500 leading-relaxed text-foreground/90">
              {brand.vision}
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        centered
        eyebrow="Core Values"
        title="The principles that guide our network"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, i) => (
            <FeatureCard
              key={value.title}
              index={i}
              eyebrow={`0${i + 1}`}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        centered
        eyebrow="Timeline"
        title="Our journey so far"
        description="From a small local group to a distributed network of builders."
      >
        <div
          ref={containerRef}
          className="relative mt-12 max-w-4xl space-y-12 mx-auto"
        >
          {/* Background track line */}
          <div className="absolute top-0 bottom-0 ml-5 -translate-x-px md:left-1/2 md:ml-0 md:-translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-border/80 to-transparent" />

          {/* Animated progress line with elegant glowing tip */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 ml-5 -translate-x-px md:left-1/2 md:ml-0 md:-translate-x-1/2 w-[2px] bg-gradient-to-b from-primary/10 via-primary/60 to-primary origin-top z-0"
          >
            {/* Elegant Glowing Tip */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-primary rounded-full z-20 shadow-[0_0_12px_3px_rgba(255,122,0,0.8)]">
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_5px_rgba(255,122,0,0.6)]"
              />
            </div>
          </motion.div>

          {timeline.map((item, index) => (
            <TimelineItem key={item.title} item={item} index={index} />
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
