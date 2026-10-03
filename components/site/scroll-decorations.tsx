"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── ParallaxDolphinWatermark ───────────────────────────────── */
export function ParallaxDolphinWatermark({
  className,
  src = "/heapify-mascot.png",
  speed = 40,
  direction = "down",
  rotateOffset = 6,
  initialRotate = 0,
  flip = false,
}: {
  className?: string;
  src?: string;
  speed?: number;
  direction?: "down" | "up";
  rotateOffset?: number;
  initialRotate?: number;
  flip?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "down" ? [-speed, speed] : [speed, -speed]
  );
  const y = useSpring(rawY, { stiffness: 90, damping: 26, mass: 0.2 });

  const rawRotate = useTransform(
    scrollYProgress,
    [0, 1],
    [initialRotate - rotateOffset, initialRotate + rotateOffset]
  );
  const rotate = useSpring(rawRotate, { stiffness: 90, damping: 26, mass: 0.2 });

  return (
    <div ref={ref} className={cn("pointer-events-none select-none -z-10", className)}>
      <motion.div
        style={{
          y,
          rotate,
          transformOrigin: "center center",
          willChange: "transform",
        }}
        className={cn("relative w-full h-full", flip && "scale-x-[-1]")}
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 160px, 200px"
        />
      </motion.div>
    </div>
  );
}

/* ─── ParallaxPhoto ──────────────────────────────────────────── */
export function ParallaxPhoto({
  src,
  alt,
  className,
  sizes,
  shiftPercent = 8,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  shiftPercent?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${shiftPercent}%`, `${shiftPercent}%`]
  );
  const y = useSpring(rawY, { stiffness: 100, damping: 28, mass: 0.2 });
  const rawScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.04, 1.08]);
  const scale = useSpring(rawScale, { stiffness: 100, damping: 28 });

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{ y, scale, willChange: "transform" }}
        className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)]"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes={sizes || "(max-width: 768px) 100vw, 40vw"}
        />
      </motion.div>
    </div>
  );
}

/* ─── ScrollRevealCard ───────────────────────────────────────── */
export function ScrollRevealCard({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.55,
        delay: (index % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
