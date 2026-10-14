import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ExternalLink,
  Info,
  Loader2,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/**
 * Trade mark screening for a name that is free on the MCA register.
 *
 * A company name containing a word that is a registered or applied-for trade mark in the same
 * class can be rejected by the Registrar, or forced to change later on the owner's complaint
 * (Companies (Incorporation) Rules, rule 8A). So after the MCA check this asks the backend, which
 * searches the IP India journal data and, for this final check, TradeMarx for registered marks,
 * and shows a green / amber / red result instead of a bare "available".
 *
 * The audience is an applicant who has never heard of a "Nice class", so everything on the card is
 * in plain words: what we checked, how worried to be, why each mark was flagged, and what to do next.
 *
 * Choosing a class matters: a same-brand mark is only red in the same class, so with no class
 * picked the most it can say about a partial match is amber.
 */

type Match = {
  applicationNo: string;
  mark: string;
  class: number | null;
  proprietor: string | null;
  status: string;
  source: "journal" | "trademarx" | "journal+trademarx";
  url: string | null;
  match: "exact" | "same-brand" | "sounds-like" | "looks-like" | "shares-first-word" | "starts-with" | "contains-word";
  sameClass: boolean | null;
  risk: "red" | "amber";
};

type Result = {
  risk: "red" | "amber" | "green";
  matches: Match[];
  coverage: {
    records: number;
    journals: number;
    latestJournalDate: string | null;
    trademarx: { enabled: boolean; used: boolean };
  };
  disclaimer: string;
};

// The 45 Nice classes, in plain words, for the picker and for labelling each match.
const CLASSES = [
  "Chemicals", "Paints & coatings", "Cosmetics & cleaning", "Oils & fuels", "Pharmaceuticals", "Metals", "Machines",
  "Hand tools", "Electronics & software", "Medical devices", "Lighting & heating", "Vehicles", "Firearms", "Jewellery",
  "Musical instruments", "Paper & stationery", "Rubber & plastics", "Leather goods", "Building materials", "Furniture",
  "Household utensils", "Ropes & tents", "Yarns & threads", "Textiles", "Clothing & footwear", "Lace & embroidery",
  "Floor coverings", "Games & toys", "Meat, dairy & preserved food", "Coffee, tea, bakery & spices",
  "Agricultural produce", "Beverages", "Alcoholic drinks", "Tobacco", "Advertising & business", "Insurance & finance",
  "Construction & repair", "Telecommunications", "Transport & travel", "Material treatment", "Education & entertainment",
  "IT & scientific services", "Food & hospitality", "Medical, beauty & farming services", "Legal & security services",
];

// Why a mark was flagged, as a sentence rather than a label.
const WHY: Record<Match["match"], string> = {
  exact: "Exactly the same name as yours",
  "same-brand": "Same brand name as yours",
  "sounds-like": "Sounds like your name",
  "looks-like": "Spelled almost the same as your name",
  "shares-first-word": "Starts with the same word as your name",
  "starts-with": "This mark begins with your name",
  "contains-word": "Contains a word from your name",
};

const VERDICT = {
  green: {
    Icon: ShieldCheck,
    scale: 0,
    band: "from-emerald-50 to-white",
    ring: "bg-success text-white",
    accent: "text-success",
    badge: "bg-success/12 text-success",
    border: "border-success/30",
    headline: (n: string) => `Good news: no trade mark clash found for “${n}”`,
    plain: "We searched registered and applied-for trade marks and found nothing that looks like this name.",
    steps: [
      "Go ahead and register your company with this name.",
      "Soon after you incorporate, file a trade mark for your brand so nobody else can claim it.",
    ],
  },
  amber: {
    Icon: AlertTriangle,
    scale: 1,
    band: "from-amber-50 to-white",
    ring: "bg-amber-500 text-white",
    accent: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-300/70",
    headline: (n: string) => `Check first: some trade marks look like “${n}”`,
    plain: "Nothing here is a certain problem, but the Registrar may notice the similarity and ask questions.",
    steps: [
      "Look at the marks below, especially any in your own business class.",
      "Ask our team for a Verified Name Report. We search IP India by hand before you file.",
    ],
  },
  red: {
    Icon: ShieldAlert,
    scale: 2,
    band: "from-rose-50 to-white",
    ring: "bg-destructive text-white",
    accent: "text-destructive",
    badge: "bg-destructive/12 text-destructive",
    border: "border-destructive/30",
    headline: (n: string) => `High risk: “${n}” is likely to be rejected`,
    plain: "Someone already owns this name, or one almost identical, as a trade mark in your kind of business.",
    steps: [
      "Choose a different name. A small change is rarely enough.",
      "Or get a written no-objection letter (NOC) from the owner. Our team can help with either.",
    ],
  },
} as const;

const SCALE = ["Clear", "Review", "High risk"];
const MAX_SHOWN = 4;

const className = (n: number | null) => (n ? `Class ${n} · ${CLASSES[n - 1] ?? ""}`.replace(/ · $/, "") : "Class not known");

export function TrademarkScreening({
  name,
  backend,
  onTryAnother,
}: {
  name: string;
  backend: string;
  /** Lets the applicant go back and type a different name. */
  onTryAnother?: () => void;
}) {
  // `picked` is what the dropdown shows; `applied` is what the result below was checked with.
  // Changing the dropdown does not search by itself: each check uses the daily quota of the
  // registered-marks source, so it waits for the button.
  const [picked, setPicked] = useState<number | "">("");
  const [applied, setApplied] = useState<number | "">("");
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [data, setData] = useState<Result | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setState("loading");
    setShowAll(false);
    const qs = new URLSearchParams({ q: name, deep: "1" });
    if (applied) qs.set("class", String(applied));
    fetch(`${backend}/api/trademarks/search?${qs}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Result) => {
        setData(d);
        setState("done");
      })
      .catch((e) => {
        if ((e as Error)?.name === "AbortError") return;
        setState("error");
      });
    return () => ctrl.abort();
  }, [name, applied, backend]);

  const shell = "mt-4 rounded-2xl bg-white text-foreground shadow-elev border border-border text-left overflow-hidden animate-in-up";

  if (state === "loading") {
    return (
      <div className={shell}>
        <div className="px-6 py-6 flex items-center gap-4">
          <div className="size-11 shrink-0 rounded-full bg-primary/10 grid place-items-center">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
          <div>
            <div className="font-display text-base font-semibold">Checking trade marks…</div>
            <div className="text-sm text-muted-foreground">
              Looking for registered and applied-for marks that resemble “{name}”.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screening is an extra: if it is down, say so and let the applicant carry on.
  if (state === "error" || !data) {
    return (
      <div className={shell}>
        <div className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
          <Info className="size-4 shrink-0" />
          Trade mark screening is unavailable right now. The company-name check above is unaffected.
        </div>
      </div>
    );
  }

  const v = VERDICT[data.risk];
  const serious = data.matches.filter((m) => m.risk === "red");
  const similar = data.matches.filter((m) => m.risk !== "red");
  // Most serious first; the rest fold away so a name with 25 hits is not a wall of text.
  const ordered = [...serious, ...similar];
  const shown = showAll ? ordered : ordered.slice(0, MAX_SHOWN);
  const hidden = ordered.length - shown.length;

  return (
    <div className={shell}>
      {/* Verdict */}
      <div className={`bg-gradient-to-b ${v.band} px-6 pt-5 pb-5`}>
        <div className="flex items-center gap-1.5 text-[11px] mono uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5" /> Trade mark check
        </div>
        <div className="mt-3 flex items-start gap-4">
          <div className={`size-14 shrink-0 rounded-2xl grid place-items-center shadow-sm ${v.ring}`}>
            <v.Icon className="size-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-display font-semibold tracking-tight leading-snug">{v.headline(name)}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.plain}</p>
          </div>
        </div>

        {/* Where this name sits on the scale */}
        <div className="mt-5" role="img" aria-label={`Risk level: ${SCALE[v.scale]}`}>
          <div className="grid grid-cols-3 gap-1.5">
            {SCALE.map((label, i) => {
              const on = i === v.scale;
              const colour = ["bg-success", "bg-amber-500", "bg-destructive"][i];
              return (
                <div key={label}>
                  <div className={`h-2 rounded-full ${on ? colour : "bg-slate-200"}`} />
                  <div className={`mt-1.5 text-center text-[11px] ${on ? `font-semibold ${v.accent}` : "text-muted-foreground"}`}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Class picker */}
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <label htmlFor="tm-class" className="text-sm font-semibold flex items-center gap-1.5">
          <Building2 className="size-4 text-primary" /> What will your company do?
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Trade marks only conflict inside the same kind of business. Pick yours for a sharper result.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            id="tm-class"
            value={picked}
            onChange={(e) => setPicked(e.target.value ? Number(e.target.value) : "")}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm max-w-full"
          >
            <option value="">Not sure / any business</option>
            {CLASSES.map((label, i) => (
              <option key={label} value={i + 1}>
                {label} (class {i + 1})
              </option>
            ))}
          </select>
          {picked !== applied && (
            <button
              type="button"
              onClick={() => setApplied(picked)}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Check again
            </button>
          )}
        </div>
      </div>

      {/* The marks */}
      {ordered.length > 0 && (
        <div className="px-6 pt-5">
          <div className="text-sm font-semibold">
            {ordered.length} similar trade mark{ordered.length === 1 ? "" : "s"} found
          </div>
          <ul className="mt-3 space-y-2.5">
            {shown.map((m) => {
              const red = m.risk === "red";
              return (
                <li
                  key={`${m.source}-${m.applicationNo}-${m.class}`}
                  className={`rounded-xl border-l-4 border border-border bg-white p-3.5 ${red ? "border-l-destructive" : "border-l-amber-400"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-[15px] break-words">{m.mark}</div>
                      <div className={`mt-0.5 text-xs font-medium ${red ? "text-destructive" : "text-amber-700"}`}>
                        {WHY[m.match]}
                      </div>
                    </div>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener"
                        className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Details <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-foreground/80">{className(m.class)}</span>
                    {m.sameClass === true && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                        Your business class
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-foreground/80">{m.status}</span>
                  </div>
                  {m.proprietor && <div className="mt-1.5 text-xs text-muted-foreground">Owned by {m.proprietor}</div>}
                </li>
              );
            })}
          </ul>
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Show {hidden} more <ChevronDown className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* What to do next */}
      <div className={`mx-6 mt-5 rounded-xl border ${v.border} p-4`}>
        <div className="text-sm font-semibold">What should I do now?</div>
        <ol className="mt-2.5 space-y-2">
          {v.steps.map((s, i) => (
            <li key={s} className="flex gap-2.5 text-sm text-foreground/85">
              <span className={`mt-0.5 size-5 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold ${v.badge}`}>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.risk === "green" ? (
            <Link
              to="/m/$slug"
              params={{ slug: "trademark" }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Protect this name with a trade mark <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <a
                href="tel:+918977079433"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Phone className="size-4" /> Get a Verified Name Report
              </a>
              {onTryAnother && (
                <button
                  type="button"
                  onClick={onTryAnother}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  <Pencil className="size-4" /> Try a different name
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* What we checked, and its limits */}
      <div className="px-6 pt-4 pb-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5 text-success" /> IP India trade marks journal
          </span>
          {data.coverage.trademarx.used && (
            <span className="inline-flex items-center gap-1">
              <Check className="size-3.5 text-success" /> Registered marks (TradeMarx)
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5 text-success" /> Same, similar-sounding and similar-spelled names
          </span>
        </div>
        <details className="group mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <summary className="cursor-pointer select-none inline-flex items-center gap-1 font-medium hover:text-foreground">
            <Info className="size-3.5" /> About this check
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-1.5">
            {data.disclaimer} Checked against {data.coverage.records.toLocaleString("en-IN")} journal records
            {data.coverage.latestJournalDate ? ` (latest issue ${data.coverage.latestJournalDate})` : ""}
            {data.coverage.trademarx.used ? " and TradeMarx" : ""}. For a verified search, ask for our Name Verification
            Report.
          </p>
        </details>
      </div>
    </div>
  );
}
