import { Link } from "@tanstack/react-router";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import logo from "@/assets/cloudcrest-logo.png";

/**
 * Global footer, rendered once by AppShell so every route carries it.
 *
 * Links point only at routes that exist (`/` and `/m/:slug`). A compliance
 * site that links to a missing privacy policy reads worse than one that does
 * not link to it at all, so the legal column is deliberately absent until
 * those pages are written.
 */

const PHONE_DISPLAY = "+91 89770 79433";
const PHONE_HREF = "+918977079433";
const EMAIL = "cloudcrestbm@gmail.com";

/** Slugs are checked against the live catalog — each one resolves to /m/:slug. */
const COLUMNS: { heading: string; links: { label: string; slug: string }[] }[] = [
  {
    heading: "Start a business",
    links: [
      { label: "Private Limited Company", slug: "company" },
      { label: "LLP Registration", slug: "llp" },
      { label: "Partnership Firm", slug: "partnership" },
      { label: "Society Registration", slug: "society" },
      { label: "HUF", slug: "huf" },
    ],
  },
  {
    heading: "Tax & licences",
    links: [
      { label: "GST Registration", slug: "gst" },
      { label: "MSME / Udyam", slug: "msme" },
      { label: "IEC Code", slug: "iec" },
      { label: "FSSAI Licence", slug: "fssai" },
      { label: "Digital Signature", slug: "dsc" },
    ],
  },
  {
    heading: "Protect your brand",
    links: [
      { label: "Trademark", slug: "trademark" },
      { label: "Copyright", slug: "copyright" },
      { label: "Patent", slug: "patent" },
      { label: "Design Registration", slug: "design" },
      { label: "ISO Certification", slug: "iso" },
    ],
  },
];


export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))]">
          {/* Brand + contact */}
          <div className="min-w-0">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={logo} alt="" aria-hidden className="h-7 w-auto" />
              <span className="sr-only">Cloudcrest — home</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Company registrations, tax filings and licences for Indian businesses — handled
              end to end by qualified professionals.
            </p>

            <div className="mt-5 space-y-2.5 text-sm">
              <a
                href={`tel:${PHONE_HREF}`}
                className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors"
              >
                <Phone className="size-4 text-primary shrink-0" />
                <span className="mono font-medium">{PHONE_DISPLAY}</span>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors break-all"
              >
                <Mail className="size-4 text-primary shrink-0" />
                <span>{EMAIL}</span>
              </a>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Clock className="size-4 text-primary shrink-0" />
                <span>Mon–Sat · 10:00–19:00 IST</span>
              </div>
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
          </div>

          {/* Service columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="min-w-0">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.slug}>
                    <Link
                      to="/m/$slug"
                      params={{ slug: l.slug }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} Cloudcrest Business Management Private Limited. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground max-w-xl sm:text-right leading-relaxed">
            Cloudcrest is a technology platform, not a law firm or a substitute for an advocate.
            Government approvals rest with the respective authority.
          </p>
        </div>
      </div>
    </footer>
  );
}
