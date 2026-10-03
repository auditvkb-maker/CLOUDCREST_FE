import { Reveal } from "@/components/reveal";

/**
 * One workspace, every filing — drawn as a flow.
 *
 * IndiaFilings anchors its platform section with exactly this: a single origin
 * node with dashed paths flowing out to the services it handles. It works
 * because the claim ("one place for all of it") is hard to make in a sentence
 * and obvious as a picture.
 *
 * The lines are a stroke-dashoffset animation on six short paths — a paint on a
 * small SVG, not a layout pass, so it stays cheap even running continuously.
 * The labels are real text in the SVG rather than images, so they are readable
 * and translatable.
 *
 * Brand blues only, separated by lightness rather than hue: the earlier
 * multi-colour version of this page read as off-brand.
 */

const ENDPOINTS = [
  { label: "Company & LLP", y: 34 },
  { label: "GST", y: 96 },
  { label: "Trademark", y: 158 },
  { label: "MSME & FSSAI", y: 220 },
  { label: "Payroll & TDS", y: 282 },
  { label: "Annual filings", y: 344 },
];

const ORIGIN = { x: 150, y: 189 };
const END_X = 360;

export function ServiceFlow() {
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
              Your documents are uploaded once and reused across every filing we handle for you —
              incorporation, tax, payroll and the annual returns that follow. No re-sending the same
              PAN card to four different people.
            </p>
          </Reveal>

          <Reveal className="reveal-right min-w-0" delay={120}>
            <svg
              viewBox="0 0 560 378"
              className="w-full h-auto"
              role="img"
              aria-label="Cloudcrest connects to company and LLP, GST, trademark, MSME and FSSAI, payroll and TDS, and annual filings"
            >
              {/* Paths first, so the nodes sit over their ends. */}
              {ENDPOINTS.map((e, i) => (
                <path
                  key={e.label}
                  d={`M ${ORIGIN.x} ${ORIGIN.y} C ${ORIGIN.x + 110} ${ORIGIN.y}, ${END_X - 110} ${e.y}, ${END_X} ${e.y}`}
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

              {/* Destinations. */}
              {ENDPOINTS.map((e) => (
                <g key={e.label}>
                  <rect
                    x={END_X - 8}
                    y={e.y - 16}
                    rx="16"
                    width="196"
                    height="32"
                    fill="var(--background)"
                    stroke="var(--border)"
                  />
                  <circle cx={END_X + 12} cy={e.y} r="4" fill="var(--primary)" />
                  <text
                    x={END_X + 26}
                    y={e.y + 4}
                    className="flow-label fill-[var(--foreground)]"
                  >
                    {e.label}
                  </text>
                </g>
              ))}
            </svg>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
