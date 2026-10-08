import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Clock, FileText, Phone } from "lucide-react";
import AppShell from "@/components/app-shell";
import { Reveal } from "@/components/reveal";
import { useAuth } from "@/hooks/use-auth";
import { useCatalogGroups } from "@/lib/service-catalog";
import { categorySlug } from "@/lib/category-slug";
import { describe } from "@/lib/service-descriptions";

/**
 * One page per catalog category (Entity Registration, Tax Registration, ...).
 *
 * The sidebar headings link here rather than scrolling the home page: a real
 * route has nothing to wait for, no scroll to correct as the page grows, and a
 * URL that can be shared and bookmarked.
 */
export const Route = createFileRoute("/services/$category")({
  component: CategoryPage,
});

// What each category is for, in a sentence or two. Keyed by the category name;
// a category an admin adds later falls back to a generic line.
const INTRO: Record<string, { lead: string; help: string }> = {
  "Entity Registration": {
    lead: "Choose the legal structure for your business and get it incorporated.",
    help: "Company, LLP, partnership or HUF — each differs in liability, compliance and tax. Not sure which fits?",
  },
  "Tax Registration": {
    lead: "The tax and trade registrations your business needs to operate and invoice legally.",
    help: "GST, PAN/TAN, MSME and import-export codes are filed against your entity details.",
  },
  "Labour Law": {
    lead: "Register as an employer and stay compliant with labour and social-security law.",
    help: "Required as soon as you hire — we handle the filings and follow-ups.",
  },
  "Municipal Licences": {
    lead: "Local licences and NOCs to operate your premises without penalties.",
    help: "Requirements vary by city and trade. Our team knows the local process.",
  },
  "Industry Licences": {
    lead: "Sector-specific approvals for food, pharma, environment and more.",
    help: "Each regulator has its own rules — we prepare the application so it is right first time.",
  },
  "Intellectual Property": {
    lead: "Protect your brand, inventions and creative work.",
    help: "From trademark search to filing across classes, handled end to end.",
  },
};
const FALLBACK_INTRO = {
  lead: "Registrations, renewals and filings handled end to end by our experts.",
  help: "Pick a service to see what is needed and start your application.",
};

function CategoryPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { groups, loading } = useCatalogGroups();
  const group = groups.find((g) => categorySlug(g.label) === category);

  const openService = (slug: string) =>
    isAdmin
      ? navigate({ to: "/admin", search: { service: slug } })
      : navigate({ to: "/m/$slug", params: { slug } });

  const intro = (group && INTRO[group.label]) || FALLBACK_INTRO;
  const others = groups.filter((g) => g !== group && !g.comingSoon);

  return (
    <AppShell>
      {/* Header band — static gradient and dot grid, no animated layers, so it
          never repaints while the page scrolls. */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary/[0.07] to-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,#000,transparent)] bg-[radial-gradient(oklch(0.55_0.18_258/0.10)_1px,transparent_1.6px)] bg-[length:22px_22px]"
        />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-10 md:pt-10 md:pb-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="size-3.5 opacity-60" />
            <span>Services</span>
            <ChevronRight className="size-3.5 opacity-60" />
            <span className="text-foreground font-medium">{group?.label ?? (loading ? "…" : "Not found")}</span>
          </nav>

          {loading ? (
            <div className="mt-8 space-y-3" aria-hidden>
              <div className="h-12 w-80 max-w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-96 max-w-full rounded bg-muted animate-pulse" />
            </div>
          ) : !group ? (
            <div className="mt-8">
              <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">Category not found</h1>
              <p className="mt-3 text-muted-foreground">
                We couldn&apos;t find that category. Pick one from the menu on the left, or{" "}
                <Link to="/" className="text-primary font-medium hover:underline">go back home</Link>.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="max-w-2xl">
                <div className="label-eyebrow text-primary mb-3">Service category</div>
                <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-[-0.025em] leading-[1.02]">
                  {group.label}
                </h1>
                <p className="mt-5 text-[16px] md:text-[17px] text-muted-foreground leading-relaxed">{intro.lead}</p>
              </div>

            </div>
          )}
        </div>
      </section>

      {group && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {group.items.map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={m.slug} delay={i * 50} className="reveal-scale">
                  <button
                    type="button"
                    onClick={() => openService(m.slug)}
                    className="group flex h-full w-full flex-col rounded-2xl border border-border bg-surface p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_40px_-16px_oklch(0.4_0.12_260/0.35)] cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="size-12 rounded-xl bg-primary/10 grid place-items-center text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                        <Icon className="size-6" />
                      </div>
                      {m.authority && (
                        <span className="rounded-md bg-muted px-2 py-1 text-[10.5px] mono font-medium uppercase tracking-wide text-muted-foreground">
                          {m.authority}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-5 text-[18px] font-display font-semibold tracking-[-0.01em] text-foreground">
                      {m.title}
                    </h2>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                      {describe(m.slug, m.title, m.short)}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {m.timelineDays && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground">
                          <Clock className="size-3" />
                          {m.timelineDays}
                        </span>
                      )}
                      {m.documentsCount != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground">
                          <FileText className="size-3" />
                          {m.documentsCount} documents
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-6">
                      <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary">
                        {isAdmin ? "View registrations" : "Start application"}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Help band */}
          <Reveal className="mt-14">
            <div className="flex flex-col gap-5 rounded-2xl bg-navy p-7 text-navy-foreground md:flex-row md:items-center md:justify-between md:p-9">
              <div className="max-w-xl">
                <h2 className="text-xl md:text-2xl font-display font-semibold">Not sure which one you need?</h2>
                <p className="mt-2 text-[14px] text-navy-foreground/70 leading-relaxed">{intro.help}</p>
              </div>
              <a
                href="tel:+918977079433"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-brand hover:opacity-95 transition-opacity"
              >
                <Phone className="size-4" /> Talk to an advisor · +91 89770 79433
              </a>
            </div>
          </Reveal>

          {/* Other categories */}
          {others.length > 0 && (
            <div className="mt-14">
              <div className="label-eyebrow mb-4">Explore other services</div>
              <div className="flex flex-wrap gap-2.5">
                {others.map((g) => (
                  <Link
                    key={g.label}
                    to="/services/$category"
                    params={{ category: categorySlug(g.label) }}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {g.label}
                    <span className="mono text-[10px] text-muted-foreground">{g.items.length}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
