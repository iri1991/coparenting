"use client";

import { useEffect, useRef, useState } from "react";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before animation starts (ms). */
  delay?: number;
  /** Stagger index for child stagger (adds delay = index * 100ms). */
  staggerIndex?: number;
}

export function AnimateOnScroll({ children, className = "", delay = 0, staggerIndex = 0 }: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalDelay = delay + staggerIndex * 100;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.7s ease-out ${totalDelay}ms, transform 0.7s ease-out ${totalDelay}ms`,
      }}
    >
      {children}
    </div>
  );
}
