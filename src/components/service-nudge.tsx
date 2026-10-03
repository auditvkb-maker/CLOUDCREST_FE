import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCatalogGroups } from "@/lib/service-catalog";

/**
 * A document character that slides out from the left every ten minutes and
 * suggests one service, then slides back.
 *
 * It works through the catalog in order rather than picking at random, so over
 * a long session every service gets its turn instead of the same two repeating.
 * The position is remembered for the session, so it carries on where it left
 * off across page navigations rather than restarting at the first service.
 *
 * Does not mount under `prefers-reduced-motion`.
 */

/** First appearance and the gap between them. Both easy to retune here. */
const FIRST_RUN_MS = 10 * 60 * 1000;
const REPEAT_MS = 10 * 60 * 1000;

const SLIDE_IN_MS = 900;
const HOLD_MS = 7000;
const SLIDE_OUT_MS = 700;

const CURSOR_KEY = "cc-nudge-cursor";

type Phase = "away" | "in" | "hold" | "out";

export function ServiceNudge() {
  const [phase, setPhase] = useState<Phase>("away");
  const [pick, setPick] = useState<{ slug: string; title: string; days?: string | null } | null>(
    null,
  );
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { groups } = useCatalogGroups();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = useCallback(() => {
    const all = groups.flatMap((g) => g.items).filter((m) => m.slug);
    if (all.length === 0) return;

    // Walk the catalog in order, skipping the service already on screen.
    let cursor = 0;
    try {
      cursor = Number(sessionStorage.getItem(CURSOR_KEY) || "0") || 0;
    } catch {
      /* blocked storage: start from the top, which is still fine */
    }

    let chosen = null as (typeof all)[number] | null;
    for (let i = 0; i < all.length; i++) {
      const candidate = all[(cursor + i) % all.length];
      if (!pathname.startsWith(`/m/${candidate.slug}`)) {
        chosen = candidate;
        try {
          sessionStorage.setItem(CURSOR_KEY, String((cursor + i + 1) % all.length));
        } catch {
          /* ignore */
        }
        break;
      }
    }
    if (!chosen) return;

    setPick({ slug: chosen.slug, title: chosen.title, days: chosen.timelineDays });
    setPhase("in");
    timers.current.push(setTimeout(() => setPhase("hold"), SLIDE_IN_MS));
    timers.current.push(setTimeout(() => setPhase("out"), SLIDE_IN_MS + HOLD_MS));
    timers.current.push(setTimeout(() => setPhase("away"), SLIDE_IN_MS + HOLD_MS + SLIDE_OUT_MS));
  }, [groups, pathname]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    if (reduced) return;

    const first = setTimeout(run, FIRST_RUN_MS);
    const repeat = setInterval(run, REPEAT_MS);
    return () => {
      clearTimeout(first);
      clearInterval(repeat);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [run]);

  if (phase === "away" || !pick) return null;

  const showing = phase === "in" || phase === "hold";

  return (
    <div
      className="fixed bottom-6 left-0 z-40 hidden sm:block"
      style={{
        transform: showing ? "translate3d(0,0,0)" : "translate3d(-110%,0,0)",
        transition: `transform ${phase === "out" ? SLIDE_OUT_MS : SLIDE_IN_MS}ms cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      <button
        type="button"
        onClick={() => navigate({ to: "/m/$slug", params: { slug: pick.slug } })}
        aria-label={`Register for ${pick.title}`}
        className="flex cursor-pointer items-end gap-2.5 rounded-r-2xl border border-l-0 border-border bg-surface py-3 pl-3 pr-4 shadow-[0_18px_44px_-14px_oklch(0.25_0.09_262_/_0.45)] transition-colors hover:bg-muted/40"
      >
        <DocCharacter />
        <span className="text-left">
          <span className="block text-[13px] font-semibold leading-snug">
            Register for {pick.title}
          </span>
          <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
            {pick.days ? `Usually ${pick.days} · ` : ""}
            <span className="font-semibold text-primary">Start now →</span>
          </span>
        </span>
      </button>
    </div>
  );
}

/**
 * A certificate with a face. Drawn rather than shipped as an image so it
 * recolours with the brand tokens and costs no extra request.
 */
function DocCharacter() {
  return (
    <svg width="46" height="54" viewBox="0 0 46 54" fill="none" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="doc-face" x1="6" y1="2" x2="40" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EDF1F8" />
        </linearGradient>
      </defs>

      {/* page with a folded corner */}
      <path
        d="M4 6a5 5 0 0 1 5-5h20l13 13v29a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V6Z"
        fill="url(#doc-face)" stroke="#C9D4E6" strokeWidth="2"
      />
      <path d="M29 1l13 13H31a2 2 0 0 1-2-2V1Z" fill="#DCE4F1" stroke="#C9D4E6" strokeWidth="2" strokeLinejoin="round" />

      {/* face */}
      <ellipse cx="17" cy="24" rx="2.4" ry="2.8" fill="#28313F" />
      <circle cx="17.8" cy="23" r="0.9" fill="white" />
      <ellipse cx="29" cy="24" rx="2.4" ry="2.8" fill="#28313F" />
      <circle cx="29.8" cy="23" r="0.9" fill="white" />
      <ellipse cx="12.5" cy="29" rx="3" ry="2" fill="#F8C9D6" opacity="0.8" />
      <ellipse cx="33.5" cy="29" rx="3" ry="2" fill="#F8C9D6" opacity="0.8" />
      <path d="M19 30c1.8 2 6.2 2 8 0" stroke="#28313F" strokeWidth="2" strokeLinecap="round" />

      {/* ruled lines + seal */}
      <path d="M11 39h13M11 44h9" stroke="#C9D4E6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="33" cy="42" r="7" fill="var(--primary)" />
      <path d="M30 42.2l2.1 2.1 3.8-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
