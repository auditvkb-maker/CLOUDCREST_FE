import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Reveals its children as they scroll into view.
 *
 * The site already had entrance animations, but they ran on mount — so every
 * section below the fold played its entrance while off-screen and had long
 * settled by the time anyone scrolled to it. All the motion happened in the
 * first half second, invisibly, which is why the page read as static.
 *
 * The hidden state is applied by JavaScript rather than in CSS: if the script
 * fails or a crawler reads the page without running it, the content must still
 * be visible. Starting at `opacity: 0` in a stylesheet risks a blank page.
 *
 * Each element is unobserved once it has appeared — these are entrances, not
 * something to replay on every pass.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  amount = 0.12,
}: {
  children: ReactNode;
  /** Element to render. Use a semantic tag where the wrapper carries meaning. */
  as?: ElementType;
  /** Stagger, in ms, for items revealed as a group. */
  delay?: number;
  className?: string;
  /** How much of the element must be on screen before it counts as visible. */
  amount?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    if (reduced) {
      setState("shown");
      return;
    }

    // Already on screen at mount (above the fold): show it without hiding it
    // first, so the top of the page does not flash empty on load.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setState("shown");
      return;
    }

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("shown");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <Tag
      ref={ref}
      className={
        className +
        (state === "hidden" ? " reveal-hidden" : "") +
        (state === "shown" ? " reveal-shown" : "")
      }
      style={state === "shown" && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
