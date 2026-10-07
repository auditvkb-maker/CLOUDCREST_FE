import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BrandLoader } from "../components/brand-loader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// TanStack's ErrorComponentProps types `error` as unknown — anything can be
// thrown, not just an Error. Narrow it here rather than asserting, so the
// message below cannot read "undefined" when something throws a string.
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(err);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(err, { boundary: "tanstack_root_error_component" });
  }, [err]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Canonical origin for this site. Update when the custom domain goes live —
 * `app.cloudcrest.in` — so Google does not index the Vercel URL and the real
 * domain as two competing copies of the same pages.
 */
const SITE_URL = "https://cloudcrestwebsite.vercel.app";

/**
 * Structured data, so Google can show the business rather than just a link —
 * name, address, phone and hours in the knowledge panel and local results.
 * Every value here is one the firm already publishes on cloudcrest.in.
 */
const ORGANISATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Cloudcrest Business Management",
  url: SITE_URL,
  image: `${SITE_URL}/favicon.png`,
  description:
    "Company, LLP, GST, MSME and trademark registration across India, with every filing reviewed by a Chartered Accountant or Company Secretary.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Level 4, N Heights, Plot No 38, Phase 2, Siddiq Nagar, HITEC City",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500081",
    addressCountry: "IN",
  },
  telephone: "+91-89770-79433",
  email: "cloudcrestbm@gmail.com",
  areaServed: "IN",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "19:00",
  },
  knowsAbout: [
    "Private Limited Company Registration",
    "LLP Registration",
    "GST Registration",
    "MSME Udyam Registration",
    "Trademark Registration",
    "Company Law Compliance",
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Written for what people actually type into Google — "company
      // registration", "GST registration", a city — rather than for how the
      // product describes itself internally. Google truncates around 155
      // characters, so the useful words come first.
      { title: "Company Registration, GST & Trademark Filing in India | Cloudcrest" },
      {
        name: "description",
        content:
          "Register a Private Limited Company, LLP, GST, MSME or trademark in India. Free MCA name check, documents uploaded once, every filing reviewed by a CA or CS. Hyderabad-based, serving all states.",
      },
      { name: "author", content: "Cloudcrest Business Management" },
      { name: "robots", content: "index, follow" },

      { property: "og:site_name", content: "Cloudcrest" },
      { property: "og:title", content: "Company Registration, GST & Trademark Filing in India" },
      {
        property: "og:description",
        content:
          "Free MCA name check, then a CA or CS handles the filing end to end — company, LLP, GST, MSME, trademark and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: SITE_URL },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Company Registration, GST & Trademark Filing in India" },
      {
        name: "twitter:description",
        content: "Free MCA name check, then a CA or CS handles the filing end to end.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "canonical", href: SITE_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORGANISATION_JSONLD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalRouteLoader />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

/**
 * Shows the company-branded loader when a route transition is actively pending.
 * Removes artificial 600ms navigation delays for instant route transitions.
 */
function GlobalRouteLoader() {
  const isNavigating = useRouterState({ select: (s) => s.status === "pending" });
  const [initialBoot, setInitialBoot] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setInitialBoot(false), 150);
    return () => clearTimeout(t);
  }, []);

  if (!initialBoot && !isNavigating) return null;
  return <BrandLoader fullscreen />;
}
