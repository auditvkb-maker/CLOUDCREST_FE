import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Link } from "@tanstack/react-router";
import {
  Database, ShieldAlert, Gavel, ArrowRight, Phone, Receipt, LineChart, Users, ExternalLink,
} from "lucide-react";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

/**
 * Home-page sections below the service cards.
 *
 * The registry band states the real size of the local MCA index the name check
 * runs against (2,712,183 company rows and 952,808 struck-off rows as loaded).
 * It is the one claim here a competitor cannot copy without doing the same work,
 * and unlike "India's largest" it is checkable.
 */

export function RegistryScale() {
  const FACTS = [
    {
      icon: Database,
      figure: "27 lakh+",
      label: "Registered companies & LLPs",
      body: "Every name you type is matched against the live MCA incorporation index, not a sample.",
    },
    {
      icon: ShieldAlert,
      figure: "9.5 lakh+",
      label: "Struck-off entities",
      body: "A struck-off name stays restricted for 20 years. Most checkers miss these entirely.",
    },
    {
      icon: Gavel,
      figure: "Seconds",
      label: "To know where you stand",
      body: "Identical, similar and struck-off matches, with the registered date and CIN of each.",
    },
  ];

  return (
    <section className="bg-navy text-navy-foreground">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <Reveal className="max-w-2xl">
          <div className="label-eyebrow text-primary mb-2">Name availability</div>
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.02em] leading-[1.08]">
            Checked against the real register
          </h2>
          <p className="mt-4 text-[15px] text-navy-foreground/70 leading-relaxed">
            A rejected name costs you the government fee and weeks of waiting. We check before you
            pay anything — against the whole register, including the struck-off list that still
            blocks a name.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:gap-8 sm:grid-cols-3">
          {FACTS.map((f, i) => (
            <Reveal
              key={f.label}
              delay={i * 110}
              className="reveal-scale lift rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <span className="grid place-items-center size-10 rounded-xl bg-primary/20 text-primary">
                <f.icon className="size-5" />
              </span>
              <div className="mt-5 text-3xl font-display font-semibold tracking-tight">
                {f.figure}
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-navy-foreground/50">
                {f.label}
              </div>
              <p className="mt-3 text-[13px] text-navy-foreground/70 leading-relaxed">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Answers are deliberately specific and, where the honest answer is "it
 * depends", say so. A compliance buyer is reading for competence, and a vague
 * reassurance reads worse than a precise caveat.
 */
const FAQS = [
  {
    q: "Can I check whether my company name is available before paying?",
    a: "Yes, and you should. The name check on this page is free and needs no account. It matches your name against active companies and LLPs as well as the struck-off register, and shows you what is already registered nearby so you can adjust before committing.",
  },
  {
    q: "What happens if the MCA rejects my name?",
    a: "You may submit up to two names with a single application, which is why the name check shows similar registered names rather than a simple yes or no. If both are rejected, the government fee for that application is not refundable — the reason we check first.",
  },
  {
    q: "How long does registration take?",
    a: "It depends on the filing and on how quickly the registry responds. Each service card shows its own expected turnaround — a private limited company is typically 7–9 working days once documents are complete, a GST registration 5–7. Delays are nearly always missing or mismatched documents.",
  },
  {
    q: "Are government fees included in what I pay?",
    a: "Government and stamp charges are passed through at cost, with no markup, and shown as separate lines in your quote. Stamp duty in particular varies by state and by authorised capital, so the figure is calculated for your specific case rather than advertised as a single price.",
  },
  {
    q: "Who actually prepares and files the documents?",
    a: "Qualified professionals — a Chartered Accountant or Company Secretary reviews every submission before it reaches the authority. Cloudcrest is a technology platform that coordinates the filing; the professional review is what stands behind it.",
  },
  {
    q: "Do I have to re-upload documents for every registration?",
    a: "No. Documents are uploaded once and reused across filings. If you register a company and then apply for GST, the PAN, Aadhaar and address proof already on file are carried forward.",
  },
  {
    q: "What happens after the certificate is issued?",
    a: "Registration is the start of the obligations, not the end — annual returns, board filings, GST returns and renewals all follow. Those filings are in the same dashboard, so post-incorporation compliance is tracked in one place rather than rediscovered each year.",
  },
];

export function HomeFaq() {
  /**
   * Which answer is open. Controlled rather than left to the accordion so that
   * pointing at a question opens it, the way the service rail opens a category
   * on hover — one interaction model across the page.
   *
   * Hover-to-open applies only where there is a real pointer. On a touch screen
   * `:hover` sticks after a tap, so driving this from hover there would fight
   * the tap that already works.
   */
  const [open, setOpen] = useState<string | undefined>(undefined);
  const hoverCapable = useRef(false);
  useEffect(() => {
    hoverCapable.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  return (
    <section className="border-b border-border bg-surface">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <Reveal className="reveal-left min-w-0">
            <div className="label-eyebrow text-primary mb-2">Questions</div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.02em] leading-[1.08]">
              Before you file
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-sm">
              The things people ask us most. If yours isn't here, an advisor will answer it
              properly rather than send you a brochure.
            </p>
            <a
              href="tel:+918977079433"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Phone className="size-4" />
              +91 89770 79433
            </a>
          </Reveal>

          <Reveal className="reveal-right min-w-0" delay={120}>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={open}
              onValueChange={setOpen}
            >
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="border-border"
                onMouseEnter={() => {
                  if (hoverCapable.current) setOpen(`faq-${i}`);
                }}
              >
                <AccordionTrigger className="text-left text-[15px] font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * What happens once the registration is done.
 *
 * Incorporation is the start of the relationship, not the end of it: the same
 * firm does the monthly bookkeeping, filings and reporting afterwards. That
 * work lives on the practice's own site rather than in this app, so both links
 * leave for cloudcrest.in rather than pretending the flow continues here.
 */
export function AfterRegistration() {
  const STEPS = [
    {
      icon: Receipt,
      title: "Monthly bookkeeping",
      body: "Sales, purchases and bank entries recorded every month, in the software you already use.",
    },
    {
      icon: Gavel,
      title: "Statutory filings",
      body: "GST, TDS and payroll returns filed on time, with the due dates tracked for you.",
    },
    {
      icon: LineChart,
      title: "Reports you can act on",
      body: "Monthly statements and management reports, so you know where the business stands.",
    },
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <Reveal className="max-w-2xl">
          <div className="label-eyebrow text-primary mb-2">After registration</div>
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.02em] leading-[1.08]">
            Registered is the start, not the finish
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
            Once you are registered we stay on, handling the monthly compliance that follows —
            from recording the books through to the reports you run the business on.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 110}
              className="reveal-scale lift rounded-2xl border border-border bg-surface p-6"
            >
              <span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <div className="mt-5 text-[16px] font-display font-semibold tracking-[-0.01em]">
                {s.title}
              </div>
              <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">{s.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap items-center gap-3" delay={140}>
          <a
            href="https://cloudcrest.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5"
          >
            See our compliance services
            <ExternalLink className="size-4" />
          </a>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            <Users className="size-4" />
            Meet the team
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function HomeCta() {
  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      <Reveal className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-[-0.025em] leading-[1.04] max-w-3xl mx-auto">
          Start with the name. We'll handle the rest.
        </h2>
        <p className="mt-5 text-[15px] md:text-base text-white/70 leading-relaxed max-w-xl mx-auto">
          Check availability free, in seconds. No account needed until you decide to file.
        </p>
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
            Talk to an advisor
          </a>
        </div>
      </Reveal>
    </section>
  );
}
