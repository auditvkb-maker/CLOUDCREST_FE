// Short, customer-facing one-liners per service. Keyed by slug; anything not
// listed falls back to a sensible template so new catalog services still read
// well.
const DESCRIPTIONS: Record<string, string> = {
  company: "Register your Private Limited Company end to end — from name approval to your incorporation certificate.",
  llp: "Set up your Limited Liability Partnership with drafting, DIN/DSC and all MCA filings handled for you.",
  partnership: "Register your Partnership Firm with a professionally drafted partnership deed and registration.",
  huf: "Create your Hindu Undivided Family entity with deed drafting and PAN, ready for tax benefits.",
  gst: "Get your GST registration and GSTIN filed and followed up by our experts, start to finish.",
  "pan-tan": "Apply for your business PAN and TAN together in a single, guided application flow.",
  msme: "Get your MSME / Udyam registration certificate quickly for subsidies, tenders and easy credit.",
  iec: "Get your Import-Export Code (IEC) from DGFT so your business can trade across borders.",
  dpiit: "Get recognised under Startup India (DPIIT) to unlock tax exemptions and funding benefits.",
  "labour-licence": "Obtain your labour licence with complete documentation and liaison support.",
  epf: "Register your business for Provident Fund (EPF) and stay compliant with EPFO from day one.",
  esi: "Register your business under ESI so your employees get medical and insurance benefits.",
  "shop-establishment": "Get your Shop & Establishment licence for your premises, handled with your local authority.",
  "trade-licence": "Get your municipal trade licence to operate your business legally and without penalties.",
  "fire-noc": "Obtain your Fire Department NOC for your premises with drawings and inspection support.",
  fssai: "Get your FSSAI food business licence — basic, state or central — filed correctly the first time.",
  "pollution-ncb": "Get your Pollution Control Board consent (NOC) to establish and operate compliantly.",
  "drug-licence": "Apply for your State FDA drug licence for retail or wholesale pharmacy operations.",
  trademark: "Protect your brand with a registered trademark, from search to filing across classes.",
  patent: "File and protect your invention with a drafted and filed patent application.",
  copyright: "Register copyright for your original creative, literary or software work.",
  design: "Register your industrial design to protect the unique look of your product.",
};

export const describe = (slug: string, title: string, short: string) =>
  DESCRIPTIONS[slug] ?? `Register your ${short || title} with Cloudcrest's compliance experts, filed end to end.`;
