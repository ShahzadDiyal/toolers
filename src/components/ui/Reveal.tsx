/**
 * BuildCalc Pro Scroll-reveal primitive.
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

/**
 * Global scroll-reveal observer. Mount ONCE in the root layout around
 * the page content.
 *
 * The scoped <Reveal> wrapper only observes `.reveal` elements inside
 * its own subtree, so any plain `className="reveal"` element rendered
 * outside one stays at opacity:0 forever (invisible calculator bug).
 * This component observes every `.reveal` in its subtree including
 * nodes added later by client-side navigation and reveals them on
 * scroll into view. Double-observing with scoped <Reveal> wrappers is
 * harmless (idempotent class add).
 */
export function GlobalReveal({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const show = (el: Element) => el.classList.add("is-visible");
    if (typeof IntersectionObserver === "undefined") {
      root.querySelectorAll(".reveal").forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const observeNew = (scope: ParentNode) => {
      scope
        .querySelectorAll(".reveal:not(.is-visible)")
        .forEach((el) => io.observe(el));
    };
    observeNew(root);
    // Catch `.reveal` nodes added after mount (client-side navigation).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) observeNew(node);
        });
      }
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  // display:contents the wrapper takes no space in layout.
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
