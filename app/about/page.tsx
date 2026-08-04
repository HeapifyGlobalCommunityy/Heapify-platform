"use client";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

import { brand, coreValues, timeline } from "@/lib/site-content";
import { FeatureCard, SectionWrapper } from "@/components/site/ui";

export default function AboutPage() {
  const timelineRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <SectionWrapper
        eyebrow="Mission & Vision"
        title="We are building the operating system for global builders"
        description="A look into the community's core purpose, values, and the journey that brought us here."
        className="pt-40"
      >
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="rounded-[2rem] border border-glass-border bg-[linear-gradient(135deg,rgba(255,122,0,0.08),rgba(255,255,255,0.02))] p-10 backdrop-blur-xl">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">Mission</h3>
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-foreground/90">{brand.mission}</p>
          </div>
          <div className="rounded-[2rem] border border-glass-border bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(255,255,255,0.02))] p-10 backdrop-blur-xl">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-blue-400">Vision</h3>
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-foreground/90">{brand.vision}</p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Core Values" title="The principles that guide our network">
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
        <div className="overflow-x-clip px-4 py-8">
          <div ref={timelineRef} className="relative max-w-5xl mx-auto">
            <div className="absolute left-5 md:left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-white/10" />
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute left-5 md:left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary via-orange-400 to-primary"
            />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <TimelineItem
                  key={item.year}
                  item={item}
                  reverse={index % 2 !== 0}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}

function TimelineItem({
  item,
  reverse,
}: {
  item: { year: string; title: string; description: string };
  reverse: boolean;
}) {
  const ref = useRef(null);
  const isVisible = useInView(ref, { amount: 0.05, once: false });
  const isActive = useInView(ref, { amount: 0.5, once: false });

  return (
    <div ref={ref} className="relative w-full py-4">
      <div className="absolute left-5 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full border border-glass-border bg-black">
        {isActive && (
          <motion.div
            key={`${item.year}-${isActive}`}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-10 h-10 rounded-full bg-primary/30"
          />
        )}
        <motion.div
          animate={{
            scale: isActive ? 1.4 : 1,
            boxShadow: isActive
              ? "0 0 20px rgba(255,122,0,.9)"
              : "0 0 0 rgba(255,122,0,0)",
          }}
          transition={{ duration: 0.35 }}
          className="w-3 h-3 rounded-full bg-primary"
        />
      </div>

      <div className={`flex w-full ${reverse ? "md:justify-start" : "md:justify-end"}`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? -100 : 100 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            x: isVisible ? 0 : reverse ? -100 : 100,
            borderColor: isActive ? "rgba(255,122,0,.4)" : "rgba(255,255,255,.08)",
            boxShadow: isActive
              ? "0 20px 60px rgba(255,122,0,.12)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
          className="ml-14 md:ml-0 w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-6"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
            {item.year}
          </span>
          <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
        </motion.div>
      </div>
    </div>
  );
}
