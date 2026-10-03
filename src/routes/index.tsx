import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import AppShell from "@/components/app-shell";
import { LandingHero } from "@/components/landing-hero";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    // Leads with the words people search for, and with the free name check,
    // which is the reason to click this result over the one above it. The old
    // copy said "20+ registrations" when the catalog had grown past fifty.
    meta: [
      { title: "Company Registration, GST & Trademark Filing in India | Cloudcrest" },
      {
        name: "description",
        content:
          "Check your company name against the live MCA register for free, then let a CA or CS file it. Private Limited, LLP, GST, MSME, trademark and 50+ more registrations, handled end to end.",
      },
      { property: "og:title", content: "Company Registration, GST & Trademark Filing in India" },
      {
        property: "og:description",
        content:
          "Free MCA name check — including struck-off names most checkers miss. Then a CA or CS handles the filing end to end.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Admins have no customer home page — send them to the admin console instead
  // of ever showing the landing page.
  useEffect(() => {
    if (!loading && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, isAdmin, navigate]);

  if (!loading && isAdmin) return null;

  return (
    <AppShell>
      <LandingHero />
    </AppShell>
  );
}

