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
                viewBox={`0 0 560 ${VIEW_H}`}
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
                      x={END_X - 8}
                      y={ys[i] - 16}
                      rx="16"
                      width="196"
                      height="32"
                      fill="var(--background)"
                      stroke="var(--border)"
                    />
                    <circle cx={END_X + 12} cy={ys[i]} r="4" fill="var(--primary)" />
                    <text x={END_X + 26} y={ys[i] + 4} className="flow-label fill-[var(--foreground)]">
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
