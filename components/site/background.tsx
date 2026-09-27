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

    let width = 0;
    let height = 0;
    let frame = 0;
    let mouse = { x: 0, y: 0, active: false };
    const nodes: Node[] = [];

    // Read theme-aware colors from CSS custom properties
    const getColors = () => {
      const style = getComputedStyle(document.documentElement);
      return {
        canvasFill: style.getPropertyValue("--canvas-fill").trim() || "rgba(255,255,255,0.01)",
        nodePrimary: style.getPropertyValue("--node-primary").trim() || "rgba(255,122,0,0.3)",
        nodeAccent: style.getPropertyValue("--node-accent").trim() || "rgba(59,130,246,0.2)",
        lineColor: style.getPropertyValue("--line-color").trim() || "rgba(255,122,0,0.06)",
      };
    };

    let colors = getColors();

    // Re-read colors when theme changes
    const observer = new MutationObserver(() => {
      colors = getColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      nodes.length = 0;
      // Fewer nodes = cleaner, less busy
      const nodeCount = Math.min(40, Math.floor((width * height) / 20000));
      for (let index = 0; index < nodeCount; index += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.4 + 0.6,
        });
      }
    };

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
    };

    const onLeave = () => {
      mouse = { x: 0, y: 0, active: false };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = colors.canvasFill;
      context.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.max(100, Math.hypot(dx, dy));
          if (distance < 200) {
            node.x += (dx / distance) * 0.2;
            node.y += (dy / distance) * 0.2;
          }
        }

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      });

      // Draw edges with conservative distance threshold
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < 140) {
            const alpha = 0.08 * (1 - distance / 140);
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.strokeStyle = colors.lineColor.replace(/[\d.]+\)$/, `${alpha})`);
            context.lineWidth = 0.8;
            context.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node, index) => {
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fillStyle = index % 8 === 0 ? colors.nodeAccent : colors.nodePrimary;
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Very subtle ambient tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.04),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,122,0,0.10),transparent)]" />
      {/* Canvas network — low opacity, fades out before content */}
      <div className="absolute inset-0 opacity-40 dark:opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
    </div>
  );
}
