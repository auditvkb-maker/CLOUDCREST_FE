import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { useCatalogGroups } from "@/lib/service-catalog";

/**
 * One workspace, every filing - drawn as a flow.
 *
 * IndiaFilings anchors its platform section with exactly this: a single origin
 * node with dashed paths flowing out to the services it handles. It works
 * because the claim ("one place for all of it") is hard to make in a sentence
 * and obvious as a picture.
 *
 * The endpoints are the catalog's own groups rather than a hand-written list.
 * The first version invented two of its six labels - there is no payroll or
 * TDS service and no annual-filings service - and a diagram promising filings
 * we do not offer is worse than no diagram. Reading the catalog also means the
 * drawing follows it when services are added or a group is renamed.
 *
 * The lines are a stroke-dashoffset animation on short paths - a paint on a
 * small SVG, not a layout pass, so it stays cheap even running continuously.
 * The labels are real text rather than images, so they are readable and
 * translatable.
 *
 * Brand blues only, separated by lightness rather than hue: the earlier
 * multi-colour version of this page read as off-brand.
 */

const ORIGIN = { x: 150, y: 189 };
const END_X = 360;
const VIEW_H = 378;
const VIEW_W = 560;

/** Pill geometry: the rect opens 8px before the dot, the label starts 34px in. */
const PILL_X = END_X - 8;
const LABEL_X = END_X + 26;
const PILL_PAD_RIGHT = 18;
const PILL_MIN_W = 150;

/**
 * Width of a pill around a label of `textW`, keeping the label clear of the
 * 16px corner radius at the closing end.
 */
function pillWidth(textW: number) {
  return Math.max(PILL_MIN_W, LABEL_X - PILL_X + textW + PILL_PAD_RIGHT);
}

/**
 * Rough width before the real glyphs can be measured, so the first paint and
 * the server-rendered markup are not wildly wrong.
 */
function estimate(label: string, fontPx: number) {
  return label.length * fontPx * 0.52;
}

/** Fits however many groups the catalog returns into the drawing's height. */
function layout(count: number) {
  const top = 34;
  const bottom = VIEW_H - 34;
  if (count <= 1) return [(top + bottom) / 2];
  const step = (bottom - top) / (count - 1);
  return Array.from({ length: count }, (_, i) => top + i * step);
}

export function ServiceFlow() {
  const { groups } = useCatalogGroups();

  // Groups that lead nowhere would be a line drawn to an empty promise.
  const families = groups.filter((g) => g.items.length > 0 && !g.comingSoon);
  const ys = layout(families.length);

  // Nothing to draw until there are groups; the copy beside it stands alone.
  // Deliberately not gated on `loading`: the hook serves a static catalog while
  // the request is in flight, and waiting for the flag left the drawing out
  // entirely whenever the backend was slow or unreachable.
  const ready = families.length > 0;

  /**
   * Measure the rendered labels and size each pill to its own.
   *
   * The width used to be a hardcoded 196, but these labels are category names
   * out of the database: "Other Business Registrations" already overran the
   * pill's rounded corner, and renaming a group or adding one would break it
   * again. `.flow-label` is also 17px below 640px and 12.5px above it, so the
   * measurement has to be redone when that breakpoint is crossed.
   */
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);

  const measure = useCallback(() => {
    const next = families.map((g, i) => {
      const el = textRefs.current[i];
      if (!el?.getComputedTextLength) return estimate(g.label, 17);
      try {
        return el.getComputedTextLength();
      } catch {
        return estimate(g.label, 17);
      }
    });
    setWidths((prev) =>
      prev.length === next.length && prev.every((w, i) => Math.abs(w - next[i]) < 0.5) ? prev : next,
    );
  }, [families]);

  useEffect(() => {
    if (!ready) return;
    measure();
    window.addEventListener("resize", measure);
    // Re-measure once the webfont swaps in; fallback metrics differ enough to
    // leave the pills visibly mis-sized.
    void document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [ready, measure]);

  const pillWidths = families.map((g, i) =>
    pillWidth(widths[i] ?? estimate(g.label, 17)),
  );
  // Grow the canvas rather than let a long label spill out of it.
  const viewW = Math.max(VIEW_W, PILL_X + Math.max(0, ...pillWidths) + 6);

  return (
    <section className="border-b border-border bg-surface">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          <Reveal className="reveal-left min-w-0">
            <div className="label-eyebrow text-primary mb-2">One workspace</div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.02em] leading-[1.08]">
              Every filing, one place
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-md">
              Your documents are uploaded once and reused across everything we file for you — from
              incorporation and tax registration through to labour law, licences and intellectual
              property. No re-sending the same PAN card to four different people.
            </p>
          </Reveal>

          <Reveal className="reveal-right min-w-0" delay={120}>
            {ready && (
              <svg
                viewBox={`0 0 ${viewW} ${VIEW_H}`}
                className="w-full h-auto"
                role="img"
                aria-label={`Cloudcrest connects to ${families.map((g) => g.label).join(", ")}`}
              >
                {/* Paths first, so the nodes sit over their ends. */}
                {families.map((g, i) => (
                  <path
                    key={g.label}
                    d={`M ${ORIGIN.x} ${ORIGIN.y} C ${ORIGIN.x + 110} ${ORIGIN.y}, ${END_X - 110} ${ys[i]}, ${END_X} ${ys[i]}`}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeOpacity={0.3 + (i % 3) * 0.12}
                    strokeDasharray="7 7"
                    className="flow-dash"
                    style={{ animationDelay: `${i * -0.5}s` }}
                  />
                ))}

                {/* Origin: the product. Two expanding rings read as throughput. */}
                <circle
                  cx={ORIGIN.x}
                  cy={ORIGIN.y}
                  r="46"
                  className="flow-pulse"
                  fill="var(--primary)"
                  opacity="0.25"
                />
                <circle
                  cx={ORIGIN.x}
                  cy={ORIGIN.y}
                  r="46"
                  className="flow-pulse"
                  fill="var(--primary)"
                  opacity="0.25"
                  style={{ animationDelay: "-1.5s" }}
                />
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r="46" fill="var(--navy, oklch(0.24 0.08 262))" />
                <text
                  x={ORIGIN.x}
                  y={ORIGIN.y + 4}
                  textAnchor="middle"
                  className="flow-origin-label fill-white font-semibold"
                >
                  Cloudcrest
                </text>

                {/* Destinations: the catalog's own groups, with their real counts. */}
                {families.map((g, i) => (
                  <g key={g.label}>
                    <rect
                      x={PILL_X}
                      y={ys[i] - 16}
                      rx="16"
                      width={pillWidths[i]}
                      height="32"
                      fill="var(--background)"
                      stroke="var(--border)"
                    />
                    <circle cx={END_X + 12} cy={ys[i]} r="4" fill="var(--primary)" />
                    <text
                      ref={(el) => {
                        textRefs.current[i] = el;
                      }}
                      x={LABEL_X}
                      y={ys[i] + 4}
                      className="flow-label fill-[var(--foreground)]"
                    >
                      {g.label}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
