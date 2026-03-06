"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const none = { duration: 0 };

/* ── FadeIn ─────────────────────────────────────────── */

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  y = 20,
  duration = 0.5,
  className,
}: FadeInProps) {
  const skip = useReducedMotion();
  return (
    <motion.div
      initial={skip ? undefined : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={skip ? none : { duration, delay, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerContainer ───────────────────────────────── */

interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  viewportOnce?: boolean;
}

export function StaggerContainer({
  children,
  stagger = 0.08,
  delay = 0,
  className,
  viewportOnce = false,
}: StaggerContainerProps) {
  const skip = useReducedMotion();
  const variants = {
    hidden: {},
    visible: {
      transition: skip
        ? { duration: 0 }
        : { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return viewportOnce ? (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerItem ────────────────────────────────────── */

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const skip = useReducedMotion();
  const variants = {
    hidden: skip ? {} : { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: skip ? none : { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

/* ── SlideDown ──────────────────────────────────────── */

interface SlideDownProps {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
}

export function SlideDown({ children, isVisible, className }: SlideDownProps) {
  const skip = useReducedMotion();
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={skip ? undefined : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={skip ? undefined : { height: 0, opacity: 0 }}
          transition={skip ? none : { duration: 0.25, ease: "easeInOut" as const }}
          className={className}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── ScaleOnHover ───────────────────────────────────── */

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.02,
  className,
}: ScaleOnHoverProps) {
  const skip = useReducedMotion();
  return (
    <motion.div
      whileHover={skip ? undefined : { scale }}
      transition={skip ? none : { duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
