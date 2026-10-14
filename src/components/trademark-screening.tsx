import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { ActivityPicker } from "@/components/activity-picker";
import { useActivities } from "@/lib/nice-activities";

/**
 * Trade mark screening, shown inside the name-availability card.
 *
 * A name that is free on the MCA register can still be rejected, or changed later on the owner's
 * complaint, if it contains a word that is a registered or applied-for trade mark in the same
 * class (Companies (Incorporation) Rules, rule 8A). This asks the backend, which searches the
 * IP India journal data and TradeMarx's registered marks, and gives a green / amber / red answer.
 *
 * It is one compact band: the verdict and the closest marks are visible at once, and the business
 * activity picker, every match, the next steps and the fine print open underneath. The applicant
 * has never heard of a "Nice class", so everything is in plain words.
 *
 * The business activity matters: a same-brand mark is red only in the business's own class and
 * amber in a related one, so with no activity picked a partial match can be no more than amber.
 */

type Match = {
  applicationNo: string;
  mark: string;
  class: number | null;
  proprietor: string | null;
  status: string;
  source: "journal" | "trademarx" | "journal+trademarx" | "well-known";
  url: string | null;
  match: "exact" | "same-brand" | "sounds-like" | "looks-like" | "shares-first-word" | "starts-with" | "contains-word";
  classMatch: "same" | "adjacent" | "other" | null;
  risk: "red" | "amber";
};

type Result = {
  risk: "red" | "amber" | "green";
  matches: Match[];
  checkedAt: string;
  coverage: {
    records: number;
    journals: number;
    latestJournalDate: string | null;
    trademarx: { enabled: boolean; used: boolean };
  };
  disclaimer: string;
};

/** What the screening tells the card around it. */
export type TmState = { state: "loading" } | { state: "unavailable" } | { state: "done"; risk: "green" | "amber" | "red"; checkedAt: string };

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
    tint: "bg-emerald-50/70",
    ring: "bg-success text-white",
    accent: "text-success",
    badge: "bg-success/12 text-success",
    border: "border-success/30",
    title: "Trade mark check: no conflict found",
    steps: [
      "Go ahead and register your company with this name.",
      "Soon after you incorporate, file a trade mark for your brand so nobody else can claim it.",
    ],
  },
  amber: {
    Icon: AlertTriangle,
    scale: 1,
    tint: "bg-amber-50/70",
    ring: "bg-amber-500 text-white",
    accent: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-300/70",
    title: "Trade mark check: possible conflict",
    steps: [
      "Look at the marks below, especially any in your own business class.",
      "Ask for a Verified Name Report. Our team searches IP India by hand before you file.",
    ],
  },
  red: {
    Icon: ShieldAlert,
    scale: 2,
    tint: "bg-rose-50/70",
    ring: "bg-destructive text-white",
    accent: "text-destructive",
    badge: "bg-destructive/12 text-destructive",
    border: "border-destructive/30",
    title: "Trade mark check: high risk of rejection",
    steps: [
      "Choose a different name. A small change is rarely enough.",
      "Or get a written no-objection letter (NOC) from the owner, using the draft below. Our team can help.",
    ],
  },
} as const;

const SCALE = ["Clear", "Review", "High risk"];
const SCALE_COLOUR = ["bg-success", "bg-amber-500", "bg-destructive"];
const SUMMARY_SHOWN = 2;
const DETAIL_SHOWN = 5;

const classLabel = (n: number | null) => (n ? `Class ${n} · ${CLASSES[n - 1] ?? ""}`.replace(/ · $/, "") : "Class not known");

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** A plain draft of the owner's consent the Registrar asks for under rule 8A(1)(b). */
function nocDraft(name: string, m: Match) {
  return [
    `To,`,
    `${m.proprietor ?? "The Proprietor / Applicant"}`,
    ``,
    `Subject: Request for consent under Rule 8A(1)(b), Companies (Incorporation) Rules, 2014`,
    ``,
    `Dear Sir / Madam,`,
    ``,
    `We propose to incorporate a company under the name "${name}". We have noted that you are the proprietor / applicant of the trade mark "${m.mark}" (${m.source === "well-known" ? "listed by IP India as a well-known mark" : `application no. ${m.applicationNo}, ${classLabel(m.class)}`}).`,
    ``,
    `Rule 8A(1)(b) requires the consent of the owner of a trade mark where a proposed company name includes a word that is the subject of a registered trade mark or of an application for registration. We therefore request your written no-objection to our use of the word "${m.mark}" as part of the company name "${name}", to be filed with the Registrar of Companies.`,
    ``,
    `Kindly sign and return a copy of this letter as your consent.`,
    ``,
    `Yours faithfully,`,
    `[Name of applicant]`,
    `[Address, phone and email]`,
    `[Date]`,
  ].join("\n");
}

export function TrademarkScreening({
  name,
  backend,
  onTryAnother,
  onState,
  initialActivityId = "",
  initialNic = "",
}: {
  name: string;
  backend: string;
  /** What the applicant already told us in the search form, so the first answer is already precise. */
  initialActivityId?: string;
  initialNic?: string;
  /** Lets the applicant go back and type a different name. */
  onTryAnother?: () => void;
  /** Reports the outcome to the card around this one. */
  onState?: (s: TmState) => void;
}) {
  // `picked` is what the dropdown shows; `applied` is what the result was checked with. Changing
  // the dropdown does not search by itself: each check spends the daily quota of the
  // registered-marks source, so it waits for the button.
  const [picked, setPicked] = useState(initialActivityId);
  const [pickedNic, setPickedNic] = useState(initialNic);
  const [applied, setApplied] = useState(initialActivityId);
  const activities = useActivities();
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [data, setData] = useState<Result | null>(null);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const activity = activities.find((a) => String(a.id) === applied);
  const classes = activity?.classes ?? [];

  useEffect(() => {
    const ctrl = new AbortController();
    setState("loading");
    setShowAll(false);
    const qs = new URLSearchParams({ q: name, deep: "1" });
    if (classes.length) qs.set("classes", classes.join(","));
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
    // `classes` is derived from `applied`; depending on it directly would re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, applied, backend]);

  // Tell the card around us what happened, so its headline can say the right thing.
  useEffect(() => {
    if (!onState) return;
    if (state === "loading") onState({ state: "loading" });
    else if (state === "error" || !data) onState({ state: "unavailable" });
    else onState({ state: "done", risk: data.risk, checkedAt: data.checkedAt });
  }, [state, data, onState]);

  const ordered = useMemo(() => (data ? [...data.matches].sort((a, b) => Number(b.risk === "red") - Number(a.risk === "red")) : []), [data]);
  const topRed = ordered.find((m) => m.risk === "red");
  const sameClassCount = ordered.filter((m) => m.classMatch === "same").length;

  if (state === "loading") {
    return (
      <div className="mx-6 mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3.5 flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-primary" />
        <div className="text-sm">
          <span className="font-semibold">Checking trade marks…</span>
          <span className="text-muted-foreground"> looking for registered and applied-for marks like “{name}”.</span>
        </div>
      </div>
    );
  }

  // Screening is an extra: if it is down, say so and let the applicant carry on.
  if (state === "error" || !data) {
    return (
      <div className="mx-6 mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
        <Info className="size-4 shrink-0" />
        Trade mark screening is unavailable right now. The company-name check is unaffected.
      </div>
    );
  }

  const v = VERDICT[data.risk];
  const summary =
    data.risk === "green"
      ? "We found no registered or applied-for mark that looks like this name."
      : `${ordered.length} similar mark${ordered.length === 1 ? "" : "s"} found${sameClassCount ? `, ${sameClassCount} in your business class` : ""}.`;
  const previews = data.risk === "green" ? [] : ordered.slice(0, SUMMARY_SHOWN);
  const shown = showAll ? ordered : ordered.slice(0, DETAIL_SHOWN);
  const hidden = ordered.length - shown.length;

  const copyNoc = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={`mx-6 mt-4 rounded-xl border ${v.border} ${v.tint} overflow-hidden`}>
      {/* Verdict — always visible */}
      <div className="px-4 pt-3.5">
        <div className="flex items-start gap-3">
          <div className={`size-10 shrink-0 rounded-xl grid place-items-center shadow-sm ${v.ring}`}>
            <v.Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-semibold leading-snug">{v.title}</div>
            <div className="mt-0.5 text-[13px] text-foreground/75 leading-snug">{summary}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-white/70 transition-colors"
          >
            {open ? "Hide" : "Details"}
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5" role="img" aria-label={`Risk level: ${SCALE[v.scale]}`}>
          {SCALE.map((label, i) => (
            <div key={label}>
              <div className={`h-1.5 rounded-full ${i === v.scale ? SCALE_COLOUR[i] : "bg-slate-200"}`} />
              <div className={`mt-1 text-center text-[10.5px] ${i === v.scale ? `font-semibold ${v.accent}` : "text-muted-foreground"}`}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {previews.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {previews.map((m) => (
              <li key={`${m.source}-${m.applicationNo}-${m.class}`} className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-[13px]">
                <span className={`size-2 shrink-0 rounded-full ${m.risk === "red" ? "bg-destructive" : "bg-amber-500"}`} aria-hidden />
                <span className="font-semibold truncate">{m.mark}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {m.source === "well-known" ? "Well-known mark · every class" : `Class ${m.class ?? "?"} · ${m.status}`}
                </span>
                <span className={`ml-auto shrink-0 text-[11px] font-medium ${m.risk === "red" ? "text-destructive" : "text-amber-700"}`}>
                  {WHY[m.match]}
                </span>
              </li>
            ))}
          </ul>
        )}

        {data.risk === "green" && (
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
            No conflicting company, LLP or trade mark found in the relevant classes as of {stamp(data.checkedAt)}. This is a
            preliminary screening based on publicly available registry data and does not guarantee approval by the Registrar of
            Companies or freedom from third-party trade mark claims. For a verified search, opt for our Name Verification Report.
          </p>
        )}
        <div className="h-3.5" />
      </div>

      {/* Details */}
      {open && (
        <div className="border-t border-border/70 bg-white px-4 py-4 space-y-4">
          {/* Business activity */}
          <div>
            <label htmlFor="tm-activity" className="text-sm font-semibold">
              What will your company mainly do?
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A trade mark only blocks a name in the same kind of business. Choose yours for a sharper result.
            </p>
            <ActivityPicker
              idPrefix="tm"
              value={picked}
              nic={pickedNic}
              onChange={({ activityId, nic }) => {
                setPicked(activityId);
                setPickedNic(nic);
              }}
            />
            {picked !== applied && (
              <button
                type="button"
                onClick={() => setApplied(picked)}
                className="mt-2 h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Check again
              </button>
            )}
            {classes.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Checked against <b className="text-foreground">{classLabel(classes[0])}</b> (your own class)
                {classes.length > 1 ? ` and related classes ${classes.slice(1).join(", ")}.` : "."}
              </p>
            )}
          </div>

          {/* The marks */}
          {ordered.length > 0 && (
            <div>
              <div className="text-sm font-semibold">
                {ordered.length} similar trade mark{ordered.length === 1 ? "" : "s"}
              </div>
              <ul className="mt-2 space-y-2">
                {shown.map((m) => {
                  const red = m.risk === "red";
                  return (
                    <li
                      key={`${m.source}-${m.applicationNo}-${m.class}`}
                      className={`rounded-lg border border-border border-l-4 bg-white p-3 ${red ? "border-l-destructive" : "border-l-amber-400"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm break-words">{m.mark}</div>
                          <div className={`text-xs font-medium ${red ? "text-destructive" : "text-amber-700"}`}>{WHY[m.match]}</div>
                        </div>
                        {m.url && (
                          <a href={m.url} target="_blank" rel="noopener" className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            Details <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {m.source === "well-known" ? (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                            Well-known mark · protected in every class
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5">{classLabel(m.class)}</span>
                        )}
                        {m.classMatch === "same" && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">Your business class</span>
                        )}
                        {m.classMatch === "adjacent" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">Related class</span>
                        )}
                        <span className="rounded-full bg-muted px-2 py-0.5">{m.status}</span>
                        {m.source !== "well-known" && <span className="rounded-full bg-muted px-2 py-0.5 mono">App. {m.applicationNo}</span>}
                      </div>
                      {m.proprietor && <div className="mt-1.5 text-xs text-muted-foreground">Owned by {m.proprietor}</div>}
                    </li>
                  );
                })}
              </ul>
              {hidden > 0 && (
                <button type="button" onClick={() => setShowAll(true)} className="mt-2 text-sm font-semibold text-primary hover:underline">
                  Show {hidden} more
                </button>
              )}
            </div>
          )}

          {/* What to do next */}
          <div className={`rounded-lg border ${v.border} p-3.5`}>
            <div className="text-sm font-semibold">What should I do now?</div>
            <ol className="mt-2 space-y-1.5">
              {v.steps.map((s, i) => (
                <li key={s} className="flex gap-2.5 text-[13px] text-foreground/85">
                  <span className={`mt-0.5 size-5 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold ${v.badge}`}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.risk !== "green" && (
                <a
                  href="tel:+918977079433"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <Phone className="size-4" /> Get a Verified Name Report
                </a>
              )}
              <Link
                to="/m/$slug"
                params={{ slug: "trademark" }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
              >
                File a trade mark <ArrowRight className="size-4" />
              </Link>
              {data.risk !== "green" && onTryAnother && (
                <button
                  type="button"
                  onClick={onTryAnother}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  <Pencil className="size-4" /> Try a different name
                </button>
              )}
            </div>

            {topRed && (
              <details className="group mt-3 rounded-lg bg-muted/40 p-3">
                <summary className="cursor-pointer select-none text-sm font-semibold inline-flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Draft a no-objection (NOC) request to the owner
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <textarea
                  readOnly
                  value={nocDraft(name, topRed)}
                  className="mt-2.5 h-56 w-full rounded-lg border border-border bg-white p-3 text-xs leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => copyNoc(nocDraft(name, topRed))}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy letter"}
                </button>
              </details>
            )}
          </div>

          {/* What was checked, and what it cannot tell you */}
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-success" /> IP India trade marks journal
              </span>
              {data.coverage.trademarx.used && (
                <span className="inline-flex items-center gap-1">
                  <Check className="size-3.5 text-success" /> Registered marks (TradeMarx)
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-success" /> IP India well-known marks list
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-success" /> Same, similar-sounding and similar-spelled names
              </span>
            </div>
            <p className="mt-1.5">
              {data.disclaimer} Checked {stamp(data.checkedAt)} against {data.coverage.records.toLocaleString("en-IN")} journal records
              {data.coverage.latestJournalDate ? ` (latest issue ${data.coverage.latestJournalDate})` : ""}
              {data.coverage.trademarx.used ? " and TradeMarx" : ""}. For a verified search, opt for our Name Verification Report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
