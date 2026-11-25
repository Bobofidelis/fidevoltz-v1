import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Entrance animations done in CSS (tailwindcss-animate) instead of a JavaScript animation library:
// the content is in the page and visible from the first paint, works without JavaScript, and
// costs nothing to download. People who ask their device for reduced motion see no animation.

interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Seconds to wait before the animation starts (for staggered lists) */
  delay?: number;
}

function animated(base: string) {
  return function Animated({ children, delay = 0, className, style, ...props }: MotionProps) {
    const delayStyle: CSSProperties | undefined = delay ? { animationDelay: `${delay}s`, ...style } : style;
    return (
      <div className={cn(base, "fill-mode-both motion-reduce:animate-none", className)} style={delayStyle} {...props}>
        {children}
      </div>
    );
  };
}

/** Fades and rises slightly: for cards and sections below the fold */
export const FadeIn = animated("animate-in fade-in slide-in-from-bottom-4 duration-500");

/** Rises into place without fading: safe for headings above the fold, which must show at once */
export const SlideUp = animated("animate-in slide-in-from-bottom-6 duration-500 ease-out");

/** Grows into place from slightly smaller */
export const ScaleIn = animated("animate-in fade-in zoom-in-95 duration-300");
