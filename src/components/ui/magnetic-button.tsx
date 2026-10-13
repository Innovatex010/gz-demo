"use client";

import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";

/**
 * Registry: @aceternity/magnetic-button — repointed. The demo dashed outline
 * and hover fill are removed; what is kept is the pull.
 */
export const MagneticButton = ({
  children,
  strength = 0.35,
  maxDistance = 60,
  className,
  wrapperClassName,
}: {
  children: React.ReactNode;
  strength?: number;
  maxDistance?: number;
  className?: string;
  wrapperClassName?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reduced) return;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    let x = (e.clientX - (left + width / 2)) * strength;
    let y = (e.clientY - (top + height / 2)) * strength;
    const distance = Math.hypot(x, y);
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      x *= scale;
      y *= scale;
    }
    setPosition({ x, y });
  };

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: a pointer-tracking
       surface, not an interactive control — the child holds the semantics */
    <div
      role="presentation"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      className={cn("inline-flex", wrapperClassName)}
    >
      <motion.div
        ref={ref}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.35 }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
};
