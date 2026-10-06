import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";

import maheshDosa from "@/assets/team/mahesh-dosa.webp";
import lavanyaNichang from "@/assets/team/lavanya-nichang.webp";
import suneelJagatha from "@/assets/team/suneel-jagatha.webp";
import vikramReddyJakka from "@/assets/team/vikram-reddy-jakka.webp";
import nareshGaikoti from "@/assets/team/naresh-gaikoti.webp";
import shivaniBung from "@/assets/team/shivani-bung.webp";

/**
 * The people behind the filings.
 *
 * Names, qualifications and remits are taken verbatim from the practice's own
 * page at cloudcrest.in/our-people — these are professional credentials, so
 * they are quoted rather than paraphrased into something looser.
 *
 * The photographs are downloaded into the repo rather than hotlinked: the
 * originals are 500x600 PNGs totalling ~2.9MB, and serving six of those on one
 * page would cost more than the rest of the site put together. Re-encoded as
 * WebP they come to 267KB.
 */

const TEAM = [
  {
    photo: maheshDosa,
    name: "Mahesh Dosa",
    honorific: "Mr.",
    quals: "FCA (ICAI), Dip. Ind AS, B.Com",
    remit: "Corporate Advisor | Ind AS Compliance | Financial Reporting & Valuation",
  },
  {
    photo: lavanyaNichang,
    name: "Lavanya Nichang",
    honorific: "Mrs.",
    quals: "ACA (ICAI), B.Com",
    remit: "Corporate Advisor, services in the field of financial planning and analysis",
  },
  {
    photo: suneelJagatha,
    name: "Suneel Jagatha",
    honorific: "Mr.",
    quals: "ACA (ICAI), Dip.IFRS (UK), B.Com",
    remit:
      "Services in the field of Finance Accounting, Taxation compliances and representation services",
  },
  {
    photo: vikramReddyJakka,
    name: "Vikram Reddy Jakka",
    honorific: "Mr.",
    quals: "ACA (ICAI), B.Com",
    remit: "Services in the field of Management and Business Consultancy",
  },
  {
    photo: nareshGaikoti,
    name: "Naresh Gaikoti",
    honorific: "Mr.",
    quals: "MBA (Finance), B.Com, CA-Intermediate",
    remit: "Services in the field of accounting, GST Advisory and compliance services",
  },
  {
    photo: shivaniBung,
    name: "Shivani Bung",
    honorific: "",
    quals: "CS (ICSI), LL.M Osmania University, B.Com",
    remit:
      "Expert in corporate governance, compliance management, and regulatory frameworks with extensive experience in SEBI regulations, company incorporations, secretarial audits, and regulatory filings.",
  },
];

export function TeamPage() {
  return (
    <div className="min-h-full bg-background">
      {/* Masthead */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
          <Reveal className="max-w-2xl">
            <div className="label-eyebrow text-primary mb-2">Our people</div>
            <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-[-0.025em] leading-[1.04]">
              A Chartered Accountant behind every filing
            </h1>
            <p className="mt-5 text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-xl">
              Your registration is not handled by a form. It is prepared, checked and submitted by
              the practice below — Chartered Accountants and a Company Secretary who sign off on
              what goes to the registry.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The team */}
      <section className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((p, i) => (
              <Reveal
                key={p.name}
                delay={i * 90}
                className="reveal-scale lift group overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="relative aspect-[5/6] overflow-hidden bg-muted">
                  <img
                    src={p.photo}
                    alt={p.name}
                    loading={i < 3 ? "eager" : "lazy"}
                    width={500}
                    height={600}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[17px] font-display font-semibold tracking-[-0.01em]">
                    {p.honorific ? `${p.honorific} ` : ""}
                    {p.name}
                  </div>
                  <div className="mono mt-1 text-[11px] uppercase tracking-[0.1em] text-primary">
                    {p.quals}
                  </div>
                  <p className="mt-3 text-[13.5px] text-muted-foreground leading-relaxed">
                    {p.remit}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Where to go next */}
      <section className="gradient-hero text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.025em] leading-[1.06] max-w-2xl mx-auto">
              Start with a name check. Talk to the team after.
            </h2>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Check a name
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="tel:+918977079433"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Phone className="size-4" />
                +91 89770 79433
              </a>
              <a
                href="https://cloudcrest.in/our-people"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                Full profiles
                <ExternalLink className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
