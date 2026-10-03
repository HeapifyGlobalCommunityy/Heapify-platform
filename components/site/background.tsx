"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

export function AnimatedNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Use devicePixelRatio for sharp rendering but limit to 2x to avoid
    // unnecessarily large canvases on hi-DPI screens.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let frame = 0;
    let mouse = { x: 0, y: 0, active: false };
    const nodes: Node[] = [];

    // Read theme-aware colors from CSS custom properties
    const getColors = () => {
      const style = getComputedStyle(document.documentElement);
      return {
        canvasFill: style.getPropertyValue("--canvas-fill").trim() || "rgba(255,255,255,0.02)",
        nodePrimary: style.getPropertyValue("--node-primary").trim() || "rgba(255,122,0,0.68)",
        nodeAccent: style.getPropertyValue("--node-accent").trim() || "rgba(59,130,246,0.5)",
        lineColor: style.getPropertyValue("--line-color").trim() || "rgba(255,122,0,0.12)",
      };
    };

    let colors = getColors();

    // Re-read colors when theme changes
    const observer = new MutationObserver(() => {
      colors = getColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Reduced node count from 54 → 32 for much better perf.
    let connectionDistance = 150;

    const resize = () => {
      const isMobile = window.innerWidth < 768;
      const nodeCount = isMobile ? 16 : 32;
      connectionDistance = isMobile ? 100 : 150;

      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes.length = 0;
      for (let index = 0; index < nodeCount; index += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.8,
        });
      }
    };

    // Throttle mousemove to every ~32ms (≈30fps) instead of every frame
    let moveTimeout: ReturnType<typeof setTimeout> | null = null;
    const onMove = (event: MouseEvent) => {
      if (moveTimeout) return;
      moveTimeout = setTimeout(() => { moveTimeout = null; }, 32);
      const rect = canvas.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
    };

    const onLeave = () => {
      mouse = { x: 0, y: 0, active: false };
    };

    let isDocumentVisible = !document.hidden;
    const onVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // Throttle to ~30fps instead of 60fps — the animation is subtle
    // enough that this is imperceptible, but halves GPU/CPU cost.
    let lastTime = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);

      if (!isDocumentVisible) return;
      if (time - lastTime < FRAME_INTERVAL) return;
      lastTime = time;

      context.clearRect(0, 0, width, height);
      context.fillStyle = colors.canvasFill;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.max(80, Math.hypot(dx, dy));
          if (distance < 240) {
            node.x += (dx / distance) * 0.28;
            node.y += (dy / distance) * 0.28;
          }
        }

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }

      // Batch line drawing into a single path for fewer draw calls
      context.lineWidth = 1;
      context.beginPath();
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          // Skip sqrt when possible — compare squared distances
          const distSq = dx * dx + dy * dy;
          if (distSq < connectionDistance * connectionDistance) {
            const distance = Math.sqrt(distSq);
            const alpha = 0.12 * (1 - distance / connectionDistance);
            context.strokeStyle = colors.lineColor.replace(/[\d.]+\)$/, `${alpha})`);
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
          }
        }
      }
      context.stroke();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fillStyle = i % 9 === 0 ? colors.nodeAccent : colors.nodePrimary;
        context.fill();
      }
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ambient warm glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.06),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,180,90,0.04),transparent_28%)]" />
      {/* Canvas network */}
      <div className="absolute inset-0 opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
      {/* Bottom fade to page background — uses CSS variable */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(transparent 0%, transparent 78%, var(--hero-overlay-to) 100%)`,
        }}
      />
    </div>
  );
}
