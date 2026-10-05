/**
 * BuildCalc Pro — Scroll-reveal primitive.
 *
 * Adds `.is-visible` to `.reveal` elements when they enter the viewport.
 * Respects prefers-reduced-motion (CSS handles the no-op).
 */
"use client";

import * as React from "react";

export function useRevealRoot<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return ref;
}

/**
 * Wrap a section's content so `.reveal` children animate on scroll.
 * Stagger via inline `style={{ "--reveal-delay": "60ms" }}`.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul";
}) {
  const ref = useRevealRoot<HTMLElement>();
  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      className={className}
    >
      {children}
    </Tag>
  );
}
