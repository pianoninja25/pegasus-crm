"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  intensity?: "soft" | "medium" | "strong";
}

/**
 * Layered ambient background — mesh gradient + animated aurora blobs +
 * subtle grid pattern. Sits at the bottom of the stacking context with
 * `pointer-events: none`.
 */
export function AuroraBackground({
  className,
  intensity = "medium",
}: AuroraBackgroundProps) {
  const opacity =
    intensity === "soft" ? 0.55 : intensity === "strong" ? 1 : 0.8;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 mesh-bg" style={{ opacity }} />

      <motion.div
        className="absolute -top-1/4 left-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full aurora-bg opacity-50 mix-blend-screen blur-3xl"
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 30, 0] }}
        transition={{ duration: 24, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-30%] right-[-10%] h-[50vmax] w-[50vmax] rounded-full aurora-bg opacity-40 mix-blend-screen blur-3xl"
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: [1.1, 0.95, 1.1], rotate: [0, -40, 0] }}
        transition={{ duration: 28, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 left-[-15%] h-[40vmax] w-[40vmax] rounded-full bg-[radial-gradient(circle_at_center,_hsl(var(--accent)/0.5),_transparent_70%)] opacity-60 mix-blend-screen blur-3xl"
        initial={{ y: 0 }}
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="absolute inset-0 grid-pattern opacity-[0.35]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background)/0.7)_85%)]" />
    </div>
  );
}
