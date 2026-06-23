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

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      nodes.length = 0;
      for (let index = 0; index < 54; index += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.7 + 0.8,
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
      context.fillStyle = "rgba(255,255,255,0.02)";
      context.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distance = Math.max(80, Math.hypot(dx, dy));
          if (distance < 260) {
            node.x += (dx / distance) * 0.32;
            node.y += (dy / distance) * 0.32;
          }
        }

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < 160) {
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.strokeStyle = `rgba(255,122,0,${0.12 * (1 - distance / 160)})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }

      nodes.forEach((node, index) => {
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fillStyle = index % 9 === 0 ? "rgba(59,130,246,0.5)" : "rgba(255,122,0,0.68)";
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,122,0,0.08),transparent_45%)]" />
      <div className="absolute inset-0 opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_78%,rgba(10,10,10,0.3)_100%)]" />
    </div>
  );
}
