import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/app-shell";
import { TeamPage } from "@/components/team-page";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — Chartered Accountants & Company Secretary | Cloudcrest" },
      {
        name: "description",
        content:
          "Meet the Chartered Accountants and Company Secretary who prepare and file your registrations — Ind AS, taxation, company law, GST and corporate governance.",
      },
      { property: "og:title", content: "Our Team | Cloudcrest" },
      {
        property: "og:description",
        content:
          "The Chartered Accountants and Company Secretary behind every Cloudcrest filing.",
      },
    ],
  }),
  component: Team,
});

function Team() {
  return (
    <AppShell>
      <TeamPage />
    </AppShell>
  );
}
