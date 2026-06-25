"use client";

import { useEffect, useRef, useState } from "react";

import { useResolvedTheme } from "@/features/theme/themeStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Radial spotlight that softly follows the cursor. Skipped on touch /
 * reduced-motion environments.
 */
export function CursorGlow() {
  const reduceMotion = usePrefersReducedMotion();
  const theme = useResolvedTheme();
  const [isCoarse, setIsCoarse] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion || isCoarse || !theme.tokens.motion) return;

    const handleMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      current.current.x += dx * 0.18;
      current.current.y += dy * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${
          current.current.x - 200
        }px, ${current.current.y - 200}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [reduceMotion, isCoarse, theme.tokens.motion]);

  if (reduceMotion || isCoarse || !theme.tokens.motion) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[400px] rounded-full opacity-50 mix-blend-screen blur-3xl"
      style={{
        background:
          "radial-gradient(circle at center, hsl(var(--primary) / 0.55) 0%, hsl(var(--accent) / 0.3) 35%, transparent 70%)",
      }}
    />
  );
}
