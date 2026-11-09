import { lazy, Suspense } from "react";
import { BrandLoader } from "@/components/brand-loader";
import { DepartmentPage } from "@/components/department-page";
import { ServiceDetailPage } from "@/components/service-detail-page";
import { DEPARTMENT_SLUGS } from "@/lib/modules";

const ClosureRoute = lazy(() => import("@/components/closure-wizard").then((m) => ({ default: m.ClosureRoute })));
const ConversionModule = lazy(() => import("@/components/conversion-wizard").then((m) => ({ default: m.ConversionModule })));
const CompanyWizard = lazy(() => import("@/components/company-wizard").then((m) => ({ default: m.CompanyWizard })));
const LlpWizard = lazy(() => import("@/components/llp-wizard").then((m) => ({ default: m.LlpWizard })));
const GstWizard = lazy(() => import("@/components/gst-wizard").then((m) => ({ default: m.GstWizard })));
const LutModule = lazy(() => import("@/components/lut-wizard").then((m) => ({ default: m.LutModule })));
const LowerTaxDeductionModule = lazy(() => import("@/components/lower-tax-deduction-wizard").then((m) => ({ default: m.LowerTaxDeductionModule })));
const Section140Module = lazy(() => import("@/components/section-140-wizard").then((m) => ({ default: m.Section140Module })));
const Section332Module = lazy(() => import("@/components/section-332-wizard").then((m) => ({ default: m.Section332Module })));
const Section354Module = lazy(() => import("@/components/section-354-wizard").then((m) => ({ default: m.Section354Module })));
const Form10aModule = lazy(() => import("@/components/form-10a-wizard").then((m) => ({ default: m.Form10aModule })));
const NonDeductionDeclarationModule = lazy(() => import("@/components/non-deduction-declaration-wizard").then((m) => ({ default: m.NonDeductionDeclarationModule })));
const RcmcModule = lazy(() => import("@/components/rcmc-wizard").then((m) => ({ default: m.RcmcModule })));
const IcegateModule = lazy(() => import("@/components/icegate-wizard").then((m) => ({ default: m.IcegateModule })));
const DpiitModule = lazy(() => import("@/components/dpiit-wizard").then((m) => ({ default: m.DpiitModule })));
const PanTanModule = lazy(() => import("@/components/pan-tan-wizard").then((m) => ({ default: m.PanTanModule })));
const PartnershipWizard = lazy(() => import("@/components/partnership-wizard").then((m) => ({ default: m.PartnershipWizard })));
const SocietyWizard = lazy(() => import("@/components/society-wizard").then((m) => ({ default: m.SocietyWizard })));
const HufWizard = lazy(() => import("@/components/huf-wizard").then((m) => ({ default: m.HufWizard })));
const LabourLicenceWizard = lazy(() => import("@/components/labour-licence-wizard").then((m) => ({ default: m.LabourLicenceWizard })));
const ProfessionalTaxWizard = lazy(() => import("@/components/professional-tax-wizard").then((m) => ({ default: m.ProfessionalTaxWizard })));
const TradeLicenceWizard = lazy(() => import("@/components/trade-licence-wizard").then((m) => ({ default: m.TradeLicenceWizard })));
const EmployerRegistrationModule = lazy(() => import("@/components/employer-registration-wizard").then((m) => ({ default: m.EmployerRegistrationModule })));
const TrustWizard = lazy(() => import("@/components/trust-wizard").then((m) => ({ default: m.TrustWizard })));
const SoleProprietorshipWizard = lazy(() => import("@/components/sole-proprietorship-wizard").then((m) => ({ default: m.SoleProprietorshipWizard })));
const MsmeModule = lazy(() => import("@/components/msme-wizard").then((m) => ({ default: m.MsmeModule })));
const NgoDarpanModule = lazy(() => import("@/components/ngo-darpan-wizard").then((m) => ({ default: m.NgoDarpanModule })));
const DinModule = lazy(() => import("@/components/din-wizard").then((m) => ({ default: m.DinModule })));
const IecModule = lazy(() => import("@/components/iec-wizard").then((m) => ({ default: m.IecModule })));
const LeiModule = lazy(() => import("@/components/lei-wizard").then((m) => ({ default: m.LeiModule })));
const ReraModule = lazy(() => import("@/components/rera-wizard").then((m) => ({ default: m.ReraModule })));
const DscModule = lazy(() => import("@/components/dsc-wizard").then((m) => ({ default: m.DscModule })));

/**
 * Each wizard is loaded on demand: opening one module downloads only that
 * module's code instead of every wizard in the catalog at once.
 */
export function ModulePage(props: Parameters<typeof ModuleBody>[0]) {
  return (
    <Suspense fallback={<BrandLoader />}>
      <ModuleBody {...props} />
    </Suspense>
  );
}

function ModuleBody({
  slug,
  initialName,
  initialType,
}: {
  slug: string;
  initialName?: string;
  /** Company structure chosen on the home name check (`pvt`, `public`, `opc`). */
  initialType?: string;
}) {
  // Company and LLP keep their bespoke multi-step incorporation wizards. GST and
  // Partnership use the category-driven picker (choose a type → see who can apply
  // and the documents for it on the standard service page → apply). Industry
  // departments use the same picker, driven by the catalog family. Every other
  // service, including anything an admin publishes, renders the catalog page.
  if (slug === "company")
    return <CompanyWizard initialName={initialName} initialEntity={initialType} />;
  if (slug === "llp") return <LlpWizard initialName={initialName} />;
  if (slug === "gst" || slug.startsWith("gst-"))
    return <GstWizard key={slug} initialName={initialName} slug={slug} />;
  if (slug === "partnership" || slug.startsWith("partnership-"))
    return <PartnershipWizard key={slug} initialName={initialName} slug={slug} />;
  if (slug === "society" || slug.startsWith("society-"))
    return <SocietyWizard key={slug} initialName={initialName} slug={slug} />;
  if (slug === "huf") return <HufWizard initialName={initialName} />;
  if (slug === "labour-licence" || slug.startsWith("labour-licence-"))
    return <LabourLicenceWizard initialName={initialName} />;
  if (slug === "professional-tax" || slug.startsWith("professional-tax-"))
    return <ProfessionalTaxWizard initialName={initialName} />;
  if (slug === "epf" || slug === "esi")
    return <EmployerRegistrationModule key={slug} slug={slug} initialName={initialName} />;
  if (slug === "trade-licence" || slug.startsWith("trade-licence-"))
    return <TradeLicenceWizard initialName={initialName} />;
  if (slug === "trust" || slug.startsWith("trust-"))
    return <TrustWizard key={slug} initialName={initialName} slug={slug} />;
  if (slug === "sole-proprietorship" || slug.startsWith("sole-proprietorship-"))
    return <SoleProprietorshipWizard key={slug} initialName={initialName} slug={slug} />;
  if (slug === "lut") return <LutModule initialName={initialName} />;
  if (slug === "lower-tax-deduction") return <LowerTaxDeductionModule initialName={initialName} />;
  if (slug === "section-140") return <Section140Module initialName={initialName} />;
  if (slug === "section-332") return <Section332Module initialName={initialName} />;
  if (slug === "section-354") return <Section354Module initialName={initialName} />;
  if (slug === "form-10a") return <Form10aModule initialName={initialName} />;
  if (slug === "non-deduction-declaration")
    return <NonDeductionDeclarationModule initialName={initialName} />;
  if (slug === "rcmc") return <RcmcModule initialName={initialName} />;
  if (slug === "icegate") return <IcegateModule initialName={initialName} />;
  if (slug === "dpiit") return <DpiitModule initialName={initialName} />;
  if (slug === "pan-tan" || slug.startsWith("pan-tan-"))
    return <PanTanModule key={slug} initialName={initialName} slug={slug} />;
  if (slug === "msme") return <MsmeModule initialName={initialName} />;
  if (slug === "ngo-darpan") return <NgoDarpanModule initialName={initialName} />;
  if (slug === "din") return <DinModule initialName={initialName} />;
  if (slug === "iec") return <IecModule initialName={initialName} />;
  if (slug === "lei") return <LeiModule initialName={initialName} />;
  if (slug === "rera") return <ReraModule initialName={initialName} />;
  if (slug === "dsc" || slug.startsWith("dsc-"))
    return <DscModule key={slug} initialName={initialName} slug={slug} />;
  if (slug.startsWith("conversion-"))
    return <ConversionModule key={slug} slug={slug} initialName={initialName} />;
  if (slug.startsWith("closure-")) return <ClosureRoute slug={slug} initialName={initialName} />;
  if (DEPARTMENT_SLUGS.has(slug)) return <DepartmentPage slug={slug} />;
  return <ServiceDetailPage slug={slug} />;
}
