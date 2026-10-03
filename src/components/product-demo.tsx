import { useEffect, useRef, useState } from "react";
import {
  Search, FileCheck2, BadgeCheck, CheckCircle2, Loader2, FileText, Upload, ShieldCheck,
} from "lucide-react";

/**
 * "How it works", with the steps driving a live mock of the product beside them.
 *
 * Built in markup rather than as a video: it needs no hosting, cannot drift out
 * of date as the real UI changes, and loads with the page instead of pulling a
 * multi-megabyte file. The three scenes mirror what the app actually does —
 * an MCA name check, a document upload, and a filing moving to approval.
 *
 * Motion is opacity/transform only (both composited) and the whole rotation
 * stops for `prefers-reduced-motion`, which lands on step one and stays there.
 */

const STEPS = [
  {
    icon: Search,
    title: "Check your name",
    body:
      "Search the live MCA register before you commit. We flag identical and deceptively similar names, and struck-off entities that still block a name.",
  },
  {
    icon: FileCheck2,
    title: "Upload once",
    body:
      "Send your documents a single time. We reuse them across every filing — no re-uploading the same PAN for each registration.",
  },
  {
    icon: BadgeCheck,
    title: "We file, you track",
    body:
      "A CA or CS reviews every submission before it goes to the authority. Follow the status in your dashboard until the certificate lands.",
  },
];

const STEP_MS = 4200;

export function ProductDemo() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    if (reduced.current || paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section className="border-b border-border bg-surface">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-center">
          {/* Steps */}
          <div className="min-w-0">
            <div className="label-eyebrow text-primary mb-2">How it works</div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.02em] leading-[1.08]">
              Three steps, and we take it from there
            </h2>

            <ol className="mt-8 space-y-2">
              {STEPS.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => {
                        setActive(i);
                        setPaused(true);
                      }}
                      aria-current={on ? "step" : undefined}
                      className={
                        "w-full text-left flex items-start gap-4 rounded-xl p-4 transition-colors duration-300 " +
                        (on ? "bg-primary/[0.06]" : "hover:bg-muted/60")
                      }
                    >
                      <span
                        className={
                          "grid place-items-center size-10 shrink-0 rounded-xl transition-all duration-300 " +
                          (on
                            ? "gradient-brand text-white shadow-brand"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <s.icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={
                            "block text-[15px] font-display font-semibold tracking-[-0.01em] transition-colors " +
                            (on ? "text-primary" : "text-foreground")
                          }
                        >
                          {s.title}
                        </span>
                        <span className="block mt-1 text-[13.5px] text-muted-foreground leading-relaxed">
                          {s.body}
                        </span>
                      </span>
                    </button>
                    {/* Progress rail — doubles as the timer for the rotation. */}
                    <div className="ml-[3.5rem] mr-4 h-0.5 rounded-full bg-border overflow-hidden">
                      <div
                        className={
                          "h-full bg-primary origin-left transition-transform ease-linear " +
                          (on ? "scale-x-100" : "scale-x-0")
                        }
                        style={{ transitionDuration: on && !paused ? `${STEP_MS}ms` : "220ms" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Live mock */}
          <div className="min-w-0">
            <div className="relative rounded-2xl border border-border bg-card shadow-[0_24px_60px_-20px_oklch(0.2_0.04_260_/_0.28)] overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                <span className="size-2.5 rounded-full bg-destructive/40" />
                <span className="size-2.5 rounded-full bg-amber-400/50" />
                <span className="size-2.5 rounded-full bg-success/40" />
                <span className="ml-3 mono text-[10px] text-muted-foreground truncate">
                  cloudcrest.in / {["name-check", "documents", "status"][active]}
                </span>
              </div>

              <div className="relative h-[21rem] sm:h-[22.5rem]">
                <Scene show={active === 0}>
                  <NameCheckScene />
                </Scene>
                <Scene show={active === 1}>
                  <UploadScene />
                </Scene>
                <Scene show={active === 2}>
                  <StatusScene />
                </Scene>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Cross-fades a scene without unmounting it, so nothing reflows mid-transition. */
function Scene({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!show}
      className={
        "absolute inset-0 p-5 sm:p-6 transition-all duration-500 " +
        (show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")
      }
    >
      {children}
    </div>
  );
}

function NameCheckScene() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-3">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground truncate">Zephyrline Technologies</span>
        <span className="ml-auto shrink-0 rounded-lg gradient-brand text-white text-[11px] font-semibold px-3 py-1.5">
          Check
        </span>
      </div>

      <div className="mt-3.5 rounded-xl border border-success/30 bg-success/5 p-3.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-success shrink-0" />
          <span className="text-sm font-semibold text-success">Name available</span>
        </div>
        <div className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">
          No active company, LLP or struck-off entity uses this brand.
        </div>
      </div>

      <div className="mt-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Similar registered names
      </div>
      <div className="mt-2 space-y-1.5">
        {[
          { n: "ZEPHYR TECHNOLOGIES PRIVATE LIMITED", s: "Active" },
          { n: "ZEPHYRLINE SOLUTIONS LLP", s: "Active" },
          { n: "ZEPHYR LINE INDIA PRIVATE LIMITED", s: "Strike Off" },
        ].map((r) => (
          <div
            key={r.n}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
          >
            <span className="text-[11.5px] text-foreground truncate flex-1">{r.n}</span>
            <span
              className={
                "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide " +
                (r.s === "Active"
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive")
              }
            >
              {r.s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadScene() {
  const FILES = [
    { n: "PAN — Director 1.pdf", p: 100 },
    { n: "Aadhaar — Director 1.pdf", p: 100 },
    { n: "Address proof.pdf", p: 72 },
    { n: "Passport photo.jpg", p: 0 },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] p-5 text-center">
        <Upload className="size-5 mx-auto text-primary" />
        <div className="mt-2 text-[13px] font-semibold">Drop your documents</div>
        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
          Uploaded once, reused across every filing
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {FILES.map((f) => (
          <div key={f.n} className="rounded-lg border border-border bg-background px-3 py-2.5">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-primary shrink-0" />
              <span className="text-[12px] text-foreground truncate flex-1">{f.n}</span>
              {f.p === 100 ? (
                <CheckCircle2 className="size-3.5 text-success shrink-0" />
              ) : f.p > 0 ? (
                <Loader2 className="size-3.5 text-primary shrink-0 animate-spin" />
              ) : (
                <span className="text-[10px] text-muted-foreground shrink-0">Queued</span>
              )}
            </div>
            <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary origin-left transition-transform duration-700"
                style={{ transform: `scaleX(${f.p / 100})` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusScene() {
  const TRACK = [
    { l: "Documents verified", d: "CA review complete", done: true },
    { l: "Filed with MCA", d: "SPICe+ submitted · INC-32", done: true },
    { l: "Under review", d: "Registrar of Companies, Telangana", done: true },
    { l: "Certificate issued", d: "Incorporation certificate ready", done: false },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold truncate">Private Limited Company</div>
          <div className="mono text-[10.5px] text-muted-foreground mt-0.5">CC-YW8DPKKG</div>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
          In progress
        </span>
      </div>

      <div className="mt-4 space-y-0">
        {TRACK.map((t, i) => (
          <div key={t.l} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={
                  "grid place-items-center size-6 shrink-0 rounded-full border-2 " +
                  (t.done
                    ? "border-success bg-success text-white"
                    : "border-border bg-background text-muted-foreground")
                }
              >
                {t.done ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Loader2 className="size-3 animate-spin" />
                )}
              </span>
              {i < TRACK.length - 1 && (
                <span className={"w-0.5 flex-1 " + (t.done ? "bg-success/40" : "bg-border")} />
              )}
            </div>
            <div className={"pb-4 min-w-0 " + (i === TRACK.length - 1 ? "pb-0" : "")}>
              <div
                className={
                  "text-[12.5px] font-semibold " + (t.done ? "text-foreground" : "text-muted-foreground")
                }
              >
                {t.l}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{t.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
        <ShieldCheck className="size-4 text-primary shrink-0" />
        <span className="text-[11.5px] text-muted-foreground leading-relaxed">
          Reviewed by a CA/CS before every submission.
        </span>
      </div>
    </div>
  );
}
