import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Phone, Users } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { HomeAbout } from "@/components/home-about";

/**
 * About, as a page of its own.
 *
 * The same material already appears on the home page, but only as a section
 * reached by scrolling: it could not be linked to, shared, or returned as a
 * search result. This gives it a real URL. The body is the existing
 * `HomeAbout` rather than a second copy of the text, so the practice's own
 * wording and its testimonials stay in one place.
 */
export function AboutPage() {
  return (
    <div className="min-h-full bg-background">
      <section className="border-b border-border bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
          <Reveal className="max-w-2xl">
            <div className="label-eyebrow text-primary mb-2">About us</div>
            <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-[-0.025em] leading-[1.04]">
              Virtual accounting, payroll and taxation — run by a practice
            </h1>
            <p className="mt-5 text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-xl">
              Cloudcrest handles company incorporation and the compliance that follows it. This
              site is where the filings start; the people who do them, and the monthly work that
              comes afterwards, are the same firm.
            </p>
          </Reveal>
        </div>
      </section>

      <HomeAbout />

      <section className="gradient-hero text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.025em] leading-[1.06] max-w-2xl mx-auto">
              Start with a name check
            </h2>
            <p className="mt-5 text-[15px] text-white/70 leading-relaxed max-w-xl mx-auto">
              Free, in seconds, against the live MCA register. No account needed until you decide
              to file.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Check a name
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Users className="size-4" />
                Meet the team
              </Link>
              <a
                href="tel:+918977079433"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                <Phone className="size-4" />
                +91 89770 79433
              </a>
              <a
                href="https://cloudcrest.in/about-us"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                The practice
                <ExternalLink className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
