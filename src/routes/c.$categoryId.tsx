import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowLeft, Mail } from "lucide-react";
import AppShell from "@/components/app-shell";
import { useCatalogGroups } from "@/lib/service-catalog";
import type { ModuleGroup } from "@/lib/modules";

/**
 * Notice page for a category marked "coming soon" in Admin -> Catalog.
 *
 * Such a category is advertised in the sidebar by name, but the public catalog
 * deliberately withholds its services, so there is nothing to list here. This
 * page exists to say that plainly rather than leave the heading clicking through
 * to an empty panel.
 */
export const Route = createFileRoute("/c/$categoryId")({
  component: CategoryComingSoon,
});

function CategoryComingSoon() {
  const { categoryId } = Route.useParams();
  const { groups, loading } = useCatalogGroups();
  const group = groups.find((g: ModuleGroup) => String(g.id) === String(categoryId));

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to all services
        </Link>

        <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/10 p-8">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center size-11 rounded-full bg-warning/20 shrink-0">
              <Clock className="size-5 text-warning" />
            </span>
            <div>
              <div className="text-[11px] mono uppercase tracking-widest text-warning">
                Coming soon
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                {loading ? "Loading…" : group?.label ?? "This category"}
              </h1>
            </div>
          </div>

          <p className="mt-5 text-muted-foreground leading-relaxed">
            We're putting this section together and it isn't open for applications yet.
            Once it opens, the services in it will appear here and you'll be able to file
            through Cloudcrest exactly as with every other registration.
          </p>

          <p className="mt-3 text-muted-foreground leading-relaxed">
            If you need one of these filings now, talk to us — we can often handle it
            manually while the online flow is being built.
          </p>

          <a
            href="mailto:cloudcrestbm@gmail.com"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Mail className="size-4" /> Talk to an advisor
          </a>
        </div>
      </div>
    </AppShell>
  );
}
