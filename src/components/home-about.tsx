import { Quote, Building2, Users, Briefcase, CalendarDays } from "lucide-react";

/**
 * About and testimonials.
 *
 * Every figure and quote here is taken verbatim from the firm's own site at
 * cloudcrest.in rather than written for effect — these are claims the business
 * already makes publicly and stands behind, which is the only kind worth
 * putting on a compliance site.
 */

const FACTS = [
  { icon: CalendarDays, figure: "10+", label: "Years of expertise" },
  { icon: Users, figure: "25+", label: "Team size" },
  { icon: Building2, figure: "100+", label: "Active clients" },
  { icon: Briefcase, figure: "500+", label: "Completed jobs" },
];

/** Quoted as published on cloudcrest.in — wording, names and roles unchanged. */
const TESTIMONIALS = [
  {
    quote:
      "We have recently incorporated a company with Cloudcrest Business Management LLP. Their incorporation services were seamless and professional. I highly recommend them to anyone seeking top-notch services.",
    name: "Pss Prashanth",
    role: "Company Director",
  },
  {
    quote:
      "CloudCrest's expert financial and tax guidance has been crucial in ensuring our business's compliance, optimizing our tax strategy, and supporting our growth, making them an invaluable partner in our success.",
    name: "Kasi Naidu",
    role: "Business Owner",
  },
  {
    quote:
      "Thank you for preparing the return. The summary looks comprehensive and well-organized. The team explained each area and section in detail. He is friendly and not commercial; he is very polite. I rate his service 5 stars.",
    name: "Suneel J",
    role: "Entrepreneur",
  },
];

export function HomeAbout() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-start">
          <div className="min-w-0">
            <div className="label-eyebrow text-primary mb-2">About us</div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.02em] leading-[1.08]">
              A practice, not a portal
            </h2>
            <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed max-w-xl">
              Cloudcrest is a firm specialising in virtual accounting, payroll and taxation
              services. We deliver financial advisory that ensures full statutory compliance,
              prompt service and maximum client satisfaction — for businesses that would rather
              build than chase paperwork.
            </p>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-xl">
              The filings on this site are handled by that same team: incorporation, GST, payroll,
              audit and company law, with a Chartered Accountant or Company Secretary behind every
              submission.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-5">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <span className="grid place-items-center size-9 rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-4" />
                  </span>
                  <div className="mt-3 text-2xl font-display font-semibold tracking-tight">
                    {f.figure}
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground leading-tight">
                    {f.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="min-w-0 space-y-4">
            <div className="label-eyebrow text-primary">What clients say</div>
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_30px_-18px_oklch(0.25_0.09_262_/_0.5)]"
              >
                <Quote className="size-4 text-primary/50" />
                <blockquote className="mt-2.5 text-[13.5px] leading-relaxed text-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid place-items-center size-9 shrink-0 rounded-full gradient-brand text-white text-[13px] font-semibold">
                    {t.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold truncate">{t.name}</span>
                    <span className="block text-[11.5px] text-muted-foreground truncate">
                      {t.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
