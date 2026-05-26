"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Fade In ---
interface FadeInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  delay?: number;
  viewportOnce?: boolean;
}

export function FadeIn({
  children,
  className,
  direction = "up",
  distance = 20,
  duration = 0.4,
  delay = 0,
  viewportOnce = true,
  ...props
}: FadeInProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // smooth cubic-bezier
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: "-50px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- Scale In ---
interface ScaleInProps extends HTMLMotionProps<"div"> {
  duration?: number;
  delay?: number;
  scale?: number;
  viewportOnce?: boolean;
}

export function ScaleIn({
  children,
  className,
  duration = 0.5,
  delay = 0,
  scale = 0.92,
  viewportOnce = true,
  ...props
}: ScaleInProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration,
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: "-40px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- Slide In ---
interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: "left" | "right";
  duration?: number;
  delay?: number;
  viewportOnce?: boolean;
}

export function SlideIn({
  children,
  className,
  direction = "left",
  duration = 0.5,
  delay = 0,
  viewportOnce = true,
  ...props
}: SlideInProps) {
  const variants: Variants = {
    hidden: {
      x: direction === "left" ? "-100%" : "100%",
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 180,
        duration,
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- Stagger Container ---
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  delayChildren?: number;
  viewportOnce?: boolean;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delayChildren = 0,
  viewportOnce = true,
  ...props
}: StaggerContainerProps) {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: "-30px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// --- Stagger Child ---
export function StaggerChild({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeOut",
        duration: 0.35,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
