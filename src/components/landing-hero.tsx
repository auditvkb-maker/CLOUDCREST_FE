import { Reveal } from "@/components/reveal";
import { ServiceFlow } from "@/components/service-flow";
import { useTypedPlaceholder } from "@/lib/use-typed-placeholder";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCatalogGroups } from "@/lib/service-catalog";
import { describe } from "@/lib/service-descriptions";
import { useAuth } from "@/hooks/use-auth";
import { SignInDialog } from "@/components/sign-in-dialog";
import { useSidebarControl } from "@/components/app-shell";
import { ProductDemo } from "@/components/product-demo";
import { RegistryScale, HomeFaq, HomeCta, AfterRegistration } from "@/components/home-sections";
import { HomeAbout } from "@/components/home-about";
import { HomeClients } from "@/components/home-clients";
import {
  NameCheckProgress,
  NameCheckResult,
  STRUCTURE_FILTERS,
  matchesStructure,
  type CompanyMatch,
  type NameCheck,
  type StructureFilter,
} from "@/components/name-check-result";
import {
  Search, ArrowRight, ShieldCheck, Clock, Users, FileText, CheckCircle2, AlertCircle,
  FileCheck2, BadgeCheck, ChevronDown,
} from "lucide-react";


// Backend origin — same convention as the rest of the app. Empty in local dev
// (Vite proxies /api); set to the backend URL in production. Using it here keeps
// the name check / similar-name calls pointed at the backend on the deployed
// site instead of the frontend's own domain (which 404s).
const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

// Names typed into the empty search field. Defined at module scope: a new
// array each render would restart the typing effect every render.
const EXAMPLE_NAMES = [
  "Acme Technologies",
  "Zephyrline Solutions",
  "Vasathi Infra",
  "Greenleaf Foods",
];

// The structure chips above the search bar (All / Private Limited / Public
// Limited / OPC / LLP) say what the applicant intends to register. They never
// change the verdict: the MCA blocks a brand across every structure at once
// ("Acme Pvt Ltd" bars "Acme LLP"), so the availability check always runs
// against all of them. The chips narrow the "similar registered names" list to
// that structure and decide where "Proceed with this name" goes — straight to
// that wizard, or, on "All", a Company / LLP choice first.

export function LandingHero() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  // Same source as the sidebar, so an admin-published service shows up in both.
  const { groups, loading } = useCatalogGroups();
  const { open: openSidebar } = useSidebarControl();
  const allModules = groups.flatMap((g) => g.items);
  /**
   * The home page's shortlist, chosen per service in Admin -> Catalog.
   *
   * Which filings lead the page is a merchandising decision that belongs to
   * whoever runs the business, not to a list hardcoded here. These slugs are
   * only the fallback for a catalog where nothing has been featured yet, so the
   * section is never empty before anyone has configured it.
   */
  const FALLBACK_SLUGS = ["company", "llp", "gst", "trademark", "msme", "fssai"];
  const featured = allModules.filter((m) => m.featured);
  const popular = (
    featured.length > 0
      ? featured
      : FALLBACK_SLUGS.map((sl) => allModules.find((m) => m.slug === sl)).filter(
          (m): m is (typeof allModules)[number] => !!m,
        )
  ).slice(0, 6);
  // While the catalog loads, counts derived from it are 0 — show an em dash
  // instead of flashing "0" until the real numbers arrive.
  const count = (n: number) => (loading ? "—" : String(n));

  // Admins land on a service's registrations; customers on the service page.
  const openService = (slug: string) =>
    isAdmin
      ? navigate({ to: "/admin", search: { service: slug } })
      : navigate({ to: "/m/$slug", params: { slug } });
  // Focus the field on arrival, but only where a keyboard is already out.
  // `autoFocus` on a phone opens the on-screen keyboard the moment the page
  // loads, covering the headline and the trust line with it.
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
      searchRef.current?.focus();
    }
  }, []);

  // The full sentence does not fit a phone, so the lead-in shortens while the
  // typed example stays the same.
  const [shortHint, setShortHint] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setShortHint(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const [q, setQ] = useState("");
  // A focused but empty field still shows its placeholder, so emptiness - not
  // focus - decides whether the typing is worth running. Gating this on focus
  // meant the desktop autofocus silenced it everywhere it would be seen, and
  // the browser hides the placeholder the moment there is a value anyway.
  const typedName = useTypedPlaceholder(EXAMPLE_NAMES, { active: q.length === 0 });
  const placeholder = shortHint
    ? `e.g. ${typedName}`
    : `Enter your business name — e.g. ${typedName}`;
  const [checking, setChecking] = useState(false);
  // The structure the applicant intends to register — see the note at the top.
  const [structure, setStructure] = useState<StructureFilter>("all");
  /**
   * The catalog is 55 services. Rendering every one made the page a ~6,400px
   * wall of identical cards with nothing to stop the eye. Each category shows
   * its first six and offers the rest, so the page stays scannable and the
   * reader chooses where to go deeper.
   */
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const CARDS_PER_CATEGORY = 6;
  // The last completed availability check, rendered as the result box.
  const [check, setCheck] = useState<NameCheck | null>(null);
  // The name the in-flight check is running on (for the progress box).
  const [checkingName, setCheckingName] = useState("");
  // Set when a signed-out visitor tries to check a name — prompts them to sign in.
  const [needAuth, setNeedAuth] = useState(false);
  type Company = CompanyMatch;

  // Existing companies with the searched name, returned by the availability check.
  const matches: Company[] = check?.matches ?? [];
  // Already-registered companies & LLPs whose brand is close to what the user is
  // typing — exact, prefix, suffix or contained — fetched live from the MCA index
  // so they can pick a distinctive name.
  const [similar, setSimilar] = useState<Company[]>([]);
  /**
   * How the registry lookup went. Without this the panel simply renders nothing
   * on an empty result, so "no company is close to this name" (good news, and
   * the whole point of a name check) looked identical to "the registry is
   * unreachable" — the failure was swallowed and the user was left guessing.
   */
  const [similarState, setSimilarState] = useState<"idle" | "loading" | "done" | "error">("idle");

  // Debounced lookup of similar existing names as the user types. Unfiltered by
  // entity structure: a taken brand blocks every structure, so the list spans
  // private, public, LLP and struck-off entities and each row is labelled.
  useEffect(() => {
    // Editing the name invalidates the previous check's result — clear it so a
    // stale verdict doesn't sit above a list that has moved on.
    setCheck(null);

    const term = q.trim();
    if (term.length < 2) {
      setSimilar([]);
      setSimilarState("idle");
      return;
    }
    setSimilarState("loading");
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BACKEND}/api/mca/similar?q=${encodeURIComponent(term)}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) throw new Error(`Registry lookup failed (${res.status})`);
        const data = await res.json();
        setSimilar(Array.isArray(data.matches) ? data.matches : []);
        setSimilarState("done");
      } catch (err) {
        // An abort is just the next keystroke superseding this request — leave
        // the state alone so the panel doesn't flicker into an error.
        if ((err as Error)?.name === "AbortError") return;
        console.error("Similar-names lookup failed:", err);
        setSimilar([]);
        setSimilarState("error");
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const checkAndGo = async (finalName: string) => {
    if (checking || !finalName.trim()) return;
    setChecking(true);
    setCheckingName(finalName);
    setNeedAuth(false);
    setCheck(null);

    try {
      const response = await fetch(`${BACKEND}/api/mca/name-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check name availability");
      }

      setCheck({
        name: finalName,
        available: !!data.available,
        reason: data.reason,
        matches: Array.isArray(data.matches) ? data.matches : [],
        source: data.source,
      });
    } catch (err: any) {
      console.error("Name check error:", err);
      setCheck({
        name: finalName,
        available: false,
        reason: err.message || "An error occurred while validating the name.",
        matches: [],
        source: "error",
      });
    } finally {
      setChecking(false);
    }
  };

  /** "Proceed with this name" — open the wizard for the chosen structure. */
  const proceedWith = (target: Exclude<StructureFilter, "all">) => {
    const name = check?.name ?? q.trim();
    if (target === "llp") {
      navigate({ to: "/m/$slug", params: { slug: "llp" }, search: { name } });
    } else {
      navigate({ to: "/m/$slug", params: { slug: "company" }, search: { name, type: target } });
    }
  };

  const filteredModules = q.trim()
    ? allModules.filter((m) => m.title.toLowerCase().includes(q.toLowerCase())).slice(0, 4)
    : [];

  // Close matches stay on screen after a check runs, so the applicant can still
  // see what is already registered nearby. The exact collisions the check
  // returned get their own panel above, so drop those from this list rather than
  // printing the same company twice.
  const shownKeys = new Set(matches.map((m) => m.name.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const similarShown = similar.filter(
    (m) =>
      !shownKeys.has(m.name.toLowerCase().replace(/[^a-z0-9]/g, "")) &&
      matchesStructure(m, structure),
  );
  // The panel opens as soon as there is something to say — results, "nothing
  // close", or "couldn't reach the registry" — not only when rows came back.
  const showSimilar =
    !needAuth && q.trim().length >= 2 && (similarShown.length > 0 || similarState === "error" || (similarState === "done" && matches.length === 0));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,oklch(0.99_0.004_250)_0%,oklch(0.955_0.022_250)_48%,oklch(0.945_0.026_250)_70%,oklch(0.975_0.012_250)_88%,oklch(1_0_0)_100%)] text-foreground">
        {/* Panning technical grid under the filing scene. */}
        <div className="hero-grid" />

        {/* Hero artwork.
            Razorpay anchors its hero with a customer photo, Stripe with a large
            flowing gradient; both put a single bold shape on the right and align
            the copy left. This is that shape, drawn from the brand blues, with
            the product's own result card layered over it so the visual says what
            the product does rather than being decoration. */}
        <div aria-hidden className="hero-art pointer-events-none">
          <span className="hero-art-blob hero-art-blob-1" />
          <span className="hero-art-blob hero-art-blob-2" />
          <span className="hero-art-blob hero-art-blob-3" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 pt-4 pb-10 text-center lg:text-left">
          <div className="lg:max-w-[58%]">
          <div className="rise-in inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white/80 px-3 py-1 text-[10px] sm:text-[11px] mono uppercase tracking-wider sm:tracking-widest text-muted-foreground shadow-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-destructive live-dot" />
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            {/* The full sentence wrapped onto two lines on a phone and broke
                the pill's shape; below sm it keeps only the part that carries
                information. Until the count arrives there is no number worth
                shortening to, so both widths show the label alone. */}
            {loading ? (
              <>
                <span className="hidden sm:inline">India's compliance workspace</span>
                <span className="sm:hidden">Compliance workspace</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">India's compliance workspace · </span>
                {count(allModules.length)} registration modules
              </>
            )}
          </div>
          <h1 className="mt-3 sm:mt-4 text-[2.15rem] sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4.25rem] font-display font-bold tracking-[-0.012em] leading-[1.04] sm:leading-[1.0]">
            <span className="rise-in inline-block" style={{ "--i": 1 } as React.CSSProperties}>
              Start your{" "}
            </span>
            {/* `pb`/`-mb`: this span is painted entirely by its own background
                (background-clip: text over transparent glyphs), and a
                background only covers the element box. An inline box sizes that
                to the font's metrics, but an inline-block — needed here because
                transforms do not apply to inline elements — sizes it to
                line-height, which is tighter than the font at leading-[0.98].
                Descenders then fell outside the painted area and the "g" in
                "registration" lost its tail. The padding extends the paint; the
                negative margin keeps it out of the layout. */}
            <span
              className="rise-in inline-block bg-clip-text pb-[0.18em] -mb-[0.18em] text-transparent italic font-normal"
              style={{
                "--i": 2,
                backgroundImage:
                  "linear-gradient(120deg, oklch(0.62 0.20 255), oklch(0.52 0.20 262) 55%, oklch(0.46 0.19 268))",
              } as React.CSSProperties}
            >
              business registration
            </span>
          </h1>

          {/* Search */}
          <div className="relative mt-5 mx-auto lg:mx-0 w-full max-w-3xl px-2 sm:px-0">
            <div
              aria-hidden
              className="hero-search-glow pointer-events-none absolute left-1/2 top-[3.2rem] h-20 w-[85%] -translate-x-1/2 -translate-y-1/2"
            />
            {/* On a phone these wrapped onto a second row and pushed the
                search field towards the fold; below sm they become one
                swipeable row instead. */}
            <div className="relative mb-4 sm:mb-0">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[oklch(0.98_0.008_250)] to-transparent sm:hidden"
              />
              <div
                className="-mx-2 flex snap-x gap-2 overflow-x-auto px-2 pb-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 justify-start sm:justify-center lg:justify-start"
                role="radiogroup"
                aria-label="Business structure"
              >
              {STRUCTURE_FILTERS.map((f) => {
                const active = structure === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setStructure(f.key)}
                    className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all active:scale-95 ${
                      active
                        ? "bg-primary text-white border-primary shadow-brand"
                        : "bg-white/70 text-foreground border-border hover:bg-white hover:border-primary/40"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
              </div>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); checkAndGo(q.trim()); }}
              className="relative flex flex-col sm:flex-row items-stretch rounded-2xl bg-white shadow-elev overflow-hidden ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300"
            >
              {/* Sweeping highlight — hidden once the field is in use. */}
              {!q && !checking && <span className="search-beam" />}
              
              {/* Icon and field stay side by side on every width — stacking them
                  left the magnifier floating on its own centred row. */}
              <div className="relative flex flex-1 min-w-0 items-center">
                <div className="pl-5 pr-2 grid place-items-center shrink-0">
                  <Search className="size-5 text-muted-foreground" />
                </div>

                <input
                  ref={searchRef}
                  disabled={checking}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 min-w-0 py-4 pr-4 text-left text-foreground text-base placeholder:text-muted-foreground bg-transparent focus:outline-none"
                />
              </div>

                <button
                  type="submit"
                  disabled={checking}
                  className="group relative flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 py-3.5 sm:py-0 px-5 sm:px-7 sm:min-w-[10rem] gradient-brand text-white font-semibold text-sm whitespace-nowrap hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {checking ? (
                    <>
                      <span className="size-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Checking…
                    </>
                  ) : (
                    <>
                      Check &amp; Next
                      <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
            </form>

            {/* What the search actually costs and covers, stated where the
                decision is made. "Free" is the main objection this removes. */}
            {!check && !checking && (
              <ul className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-5 gap-y-1.5 text-[11.5px] sm:text-[12.5px] text-muted-foreground">
                {[
                  "Free — no account needed",
                  "27 lakh+ companies & LLPs",
                  "Includes struck-off names",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-success shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            )}

            {checking && <NameCheckProgress name={checkingName} />}


            {(showSimilar || filteredModules.length > 0) && (
              <div className="mt-3 rounded-xl bg-white text-foreground shadow-elev border border-border text-left overflow-hidden">
                {showSimilar && (
                  <div>
                    <div className="label-eyebrow px-4 pt-3 pb-1">
                      Similar already registered names
                      <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/70">
                        ({similarShown.length}) ·{" "}
                        {structure === "all"
                          ? "companies, LLPs and struck-off entities"
                          : STRUCTURE_FILTERS.find((f) => f.key === structure)?.label}
                      </span>
                    </div>

                    {similarState === "error" && (
                      <div className="px-4 py-3 text-[13px] text-rose-600 flex items-start gap-2">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <span>
                          Couldn&apos;t reach the MCA registry, so existing names can&apos;t be shown
                          right now. Check your connection and try again.
                        </span>
                      </div>
                    )}

                    {similarState === "done" && similarShown.length === 0 && (
                      <div className="px-4 py-3 text-[13px] text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                        <span>
                          {structure === "all"
                            ? `No registered company or LLP has a name close to “${q.trim()}”.`
                            : `No registered ${STRUCTURE_FILTERS.find((f) => f.key === structure)?.label} has a name close to “${q.trim()}”.`}
                        </span>
                      </div>
                    )}
                    {/* Capped in height so a long list of near-misses doesn't push
                        the rest of the page off screen. */}
                    <ul className="pb-1 max-h-[26rem] overflow-y-auto">
                      {similarShown.map((m, i) => {
                        const statusText = m.companyStatus || m.status;
                        const isStrike = statusText?.toLowerCase().includes("strike") || statusText?.toLowerCase().includes("dissolved");
                        const isActive = statusText?.toLowerCase().includes("active");
                        return (
                          <li key={(m.name ?? "") + i} className="px-4 py-2.5 border-b border-border last:border-b-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold">{m.name}</div>
                              {statusText && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border ${
                                    isStrike
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                      : isActive
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                      : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
                                  }`}
                                >
                                  {statusText}
                                </span>
                              )}
                            </div>
                            <div className="text-[12px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                              {/* The structure filter is gone from the search bar,
                                  so the row says which structure this one is. */}
                              {m.entityType && <span className="font-medium text-foreground/70">{m.entityType}</span>}
                              {m.identifier && <span className="font-mono font-medium text-primary">CIN: {m.identifier}</span>}
                              {(() => {
                                const cleanLoc = m.location && m.identifier
                                  ? m.location.replace(m.identifier, "").replace(/^[ ·-]+|[ ·-]+$/g, "").trim()
                                  : m.location;
                                return cleanLoc ? <span>{cleanLoc}</span> : null;
                              })()}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {filteredModules.length > 0 && (
                  <div className={showSimilar ? "border-t border-border" : ""}>
                    <div className="label-eyebrow px-4 pt-3 pb-1">Matching services</div>
                    <ul className="pb-2">
                      {filteredModules.map((m) => {
                        const Icon = m.icon;
                        return (
                          <li key={m.slug}>
                            <button
                              onClick={() => openService(m.slug)}
                              className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                            >
                              <Icon className="size-4 text-primary" />
                              <span className="text-sm flex-1">{m.title}</span>
                              <span className="text-[11px] mono text-muted-foreground">{m.authority}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!checking && check && (
              <NameCheckResult
                check={check}
                similar={similar}
                filter={structure}
                backend={BACKEND}
                onProceed={proceedWith}
                onClose={() => setCheck(null)}
              />
            )}
          </div>

          {/* Set in the display serif to match the headline. Alignment follows
              the rest of the hero column: centred on narrow screens, ranged left
              from lg. */}
          {/* Body copy, so it uses the body face. This carried `font-display`,
              which set it in the serif heading face at 20px while the matching
              paragraphs in the sections below it were sans — the three read as
              three different voices. */}
          <p className="mt-4 sm:mt-5 text-foreground/80 text-[14.5px] sm:text-[15.5px] md:text-[16.5px] max-w-xl mx-auto lg:mx-0 text-center lg:text-left leading-[1.6] tracking-[-0.005em]">
            Check your name against the live MCA register, upload documents once, and let a CA or
            CS handle every filing — MCA, GST, MSME, Trademark and more.
          </p>

          </div>

          {/* Product card over the artwork.
              Razorpay layers real proof over its hero image rather than leaving
              it decorative; this does the same with the thing the product
              actually does — a name check, its verdict, and the registered
              names it found nearby. Shown from lg only, where the artwork it
              sits on also appears. */}
          <div
            aria-hidden
            /* Anchored to a fixed offset from the top rather than centred: a
               name check expands the column to its left by several hundred
               pixels, and a centred card slid down the page as the results
               opened. */
            /* Shown from xl, not lg: the breakpoint measures the viewport, but
               the sidebar takes about 205px out of it, so at lg widths this
               card had no room and sat on top of the search field and the
               structure chips. */
            className="pointer-events-none hidden xl:block absolute right-12 top-36 w-[25rem] 2xl:w-[27rem]"
          >
            <div className="hero-float rounded-2xl border border-white/60 bg-white/85 p-5 shadow-[0_32px_80px_-24px_oklch(0.25_0.09_262_/_0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <span className="text-[13px] text-foreground truncate">Zephyrline Technologies</span>
                <span className="ml-auto shrink-0 rounded-lg gradient-brand px-3 py-1.5 text-[11px] font-semibold text-white">
                  Check
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-3.5 py-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span className="text-[13px] font-semibold text-success">Name available</span>
                <span className="ml-auto mono text-[10px] text-muted-foreground">0.4s</span>
              </div>

              <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
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
                    <span className="flex-1 truncate text-[11px] text-foreground">{r.n}</span>
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

            {/* Offset chip, the way Razorpay hangs proof points off its hero card. */}
            <div className="hero-float-chip absolute -left-12 -bottom-7 rounded-xl border border-white/60 bg-white/90 px-4 py-3 shadow-[0_18px_44px_-14px_oklch(0.25_0.09_262_/_0.4)] backdrop-blur-xl">
              <div className="text-[15px] font-display font-semibold tracking-tight">27 lakh+</div>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Records searched
              </div>
            </div>
          </div>

          {/* Oversized stat band */}
          <div className="mt-6 sm:mt-7 grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 border-t border-border pt-6">
            {[
              { n: "10+", l: "Years of expertise" },
              { n: "100+", l: "Active clients" },
              { n: loading ? "—" : `${allModules.length}+`, l: "Registration modules" },
              { n: "500+", l: "Completed jobs" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[1.75rem] sm:text-3xl md:text-4xl font-display font-semibold tracking-tight">{s.n}</div>
                <div className="mt-1 text-[10px] sm:text-[11px] mono uppercase tracking-wider sm:tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductDemo />

      {/* Popular services.
          The sidebar already lists all 55 services, so repeating the full
          catalog here was the same content twice — and it made the page a
          ~6,400px wall of identical cards. The home page now shows the handful
          people actually arrive looking for and points at the sidebar for the
          rest. */}
      {/* The sidebar's category headings scroll here, so this needs a stable id
          and enough scroll margin to clear the sticky header. */}
      <section id="services" className="relative scroll-mt-24 pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="cards-blue-glow">
          <span className="cloud-1" />
          <span className="cloud-2" />
          <span className="cloud-3" />
          <span className="cloud-4" />
          <span className="cards-sheen" />
        </div>
        <div className="relative z-[1] max-w-[1400px] mx-auto px-6 md:px-12">
          <Reveal className="max-w-2xl">
            <div className="label-eyebrow text-primary mb-2">Services</div>
            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-[-0.02em] leading-[1.04]">
              Everything you need to run a{" "}
              <span className="italic font-normal">compliant</span> business
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              The filings most businesses start with — open the menu for all{" "}
              {loading ? "our" : `${allModules.length}`} registrations, renewals and closures.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popular.map((m, ci) => {
              const Icon = m.icon;
              return (
                <Reveal key={m.slug} delay={ci * 70} className="reveal-scale">
                <button
                  onClick={() => openService(m.slug)}
                  className="group relative flex h-full w-full flex-col min-h-[13rem] overflow-hidden rounded-2xl text-left border border-border bg-surface p-6 shadow-[0_4px_10px_-2px_oklch(0.2_0.04_260_/_0.1),0_18px_44px_-12px_oklch(0.2_0.04_260_/_0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:bg-navy hover:shadow-[0_28px_64px_-14px_oklch(0.24_0.08_260_/_0.75)]"
                >
                  <span
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 0% 0%, oklch(0.55 0.20 255 / 0.4), transparent 55%)",
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="size-11 rounded-xl bg-primary/10 grid place-items-center text-primary transition-all duration-300 group-hover:gradient-brand group-hover:text-white group-hover:shadow-brand group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5" />
                  </div>
                  <div className="relative mt-5 text-[16px] font-display font-semibold tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-white">
                    {m.title}
                  </div>
                  <div className="relative flex-1 mt-2 text-[13px] font-sans leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-white/75">
                    {describe(m.slug, m.title, m.short)}
                  </div>
                  {(m.timelineDays || m.documentsCount != null) && (
                    <div className="relative mt-4 flex flex-wrap items-center gap-2">
                      {m.timelineDays && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/80">
                          <Clock className="size-3" />
                          {m.timelineDays}
                        </span>
                      )}
                      {m.documentsCount != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/80">
                          <FileText className="size-3" />
                          {m.documentsCount} Documents
                        </span>
                      )}
                    </div>
                  )}
                </button>
                </Reveal>
              );
            })}
          </div>

          {/* The rail is the full catalog, so this opens it rather than
              navigating to yet another list. */}
          <Reveal className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={openSidebar}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-[13.5px] font-semibold shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              View all {loading ? "" : `${allModules.length} `}services
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Reveal>
        </div>
      </section>

      <ServiceFlow />
      <HomeAbout />
      <AfterRegistration />
      <RegistryScale />
      <HomeFaq />
      <HomeClients />
      <HomeCta />

      {/* Sign-in required before starting a registration from the search. */}
      <SignInDialog
        open={needAuth}
        onClose={() => setNeedAuth(false)}
        reason="Please sign in to check your business name and start your registration."
        next="/"
      />
    </div>
  );
}
