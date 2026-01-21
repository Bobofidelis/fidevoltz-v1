"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn = ({ children, delay = 0, className, ...props }: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({ children, delay = 0, className, ...props }: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring" }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0, className, ...props }: MotionProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
