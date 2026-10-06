import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/app-shell";
import { AboutPage } from "@/components/about-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Cloudcrest — Virtual Accounting, Payroll & Taxation" },
      {
        name: "description",
        content:
          "Cloudcrest is a practice specialising in virtual accounting, payroll and taxation. Company incorporation, GST, audit and company law, handled by Chartered Accountants.",
      },
      { property: "og:title", content: "About Cloudcrest" },
      {
        property: "og:description",
        content:
          "A practice, not a portal — virtual accounting, payroll and taxation for businesses that would rather build than chase paperwork.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <AppShell>
      <AboutPage />
    </AppShell>
  );
}
