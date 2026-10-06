import { Reveal } from "@/components/reveal";
import oxygenta from "@/assets/clients/oxygenta-pharmaceuticals.png";
import vista from "@/assets/clients/vista-pharmaceuticals.png";
import pascalcase from "@/assets/clients/pascalcase-software.png";
import klr from "@/assets/clients/klr-digitech.png";
import towerCloud from "@/assets/clients/tower-cloud.png";
import vijayaVarahi from "@/assets/clients/vijaya-varahi.png";
import celzene from "@/assets/clients/celzene-it.png";
import pulsebridge from "@/assets/clients/pulsebridge-health.png";
import weiterEdge from "@/assets/clients/weiter-edge.png";
import tristar from "@/assets/clients/tristar-global-academy.png";
import immitrics from "@/assets/clients/immitrics-overseas.png";
import highOnLove from "@/assets/clients/high-on-love-films.png";
import sanchi from "@/assets/clients/sanchi-educational.png";
import prajay from "@/assets/clients/prajay-megapolis.png";
import vasathi from "@/assets/clients/vasathi-anandi.png";

/**
 * Client logo marquee.
 *
 * The logos come from the firm's own site, downloaded into the repo rather than
 * hotlinked: the files there carry build hashes in their names
 * (`Celzene…-YNURZaGm.png`) and would 404 the next time that site is rebuilt.
 *
 * The track renders its list twice and translates by exactly -50%, so the
 * second copy lands where the first began and the loop is seamless. Transform
 * only, so it stays on the compositor, and it stops on hover and under
 * `prefers-reduced-motion`.
 */

const CLIENTS = [
  { src: oxygenta, name: "Oxygenta Pharmaceuticals Limited" },
  { src: vista, name: "Vista Pharmaceuticals Limited" },
  { src: pascalcase, name: "Pascalcase Software Private Limited" },
  { src: klr, name: "KLR Digitech Private Limited" },
  { src: towerCloud, name: "Tower Cloud Private Limited" },
  { src: vijayaVarahi, name: "Vijaya Varahi Technologies Private Limited" },
  { src: celzene, name: "Celzene IT Services Pvt Ltd" },
  { src: pulsebridge, name: "Pulsebridge Health Care Pvt Ltd" },
  { src: weiterEdge, name: "Weiter Edge Private Limited" },
  { src: tristar, name: "Tristar Global Academy Pvt Ltd" },
  { src: immitrics, name: "Immitrics Overseas Consultancy LLP" },
  { src: highOnLove, name: "High On Love Films LLP" },
  { src: sanchi, name: "Sanchi Educational and Welfare Society" },
  { src: prajay, name: "Prajay Megapolis Flat Owners MACS" },
  { src: vasathi, name: "Vasathi Anandi" },
];


function Marquee({
  items,
  seconds,
  reverse,
  height,
}: {
  items: { src: string; name: string }[];
  seconds: number;
  reverse?: boolean;
  height: string;
}) {
  return (
    <div className="logo-marquee group relative overflow-hidden">
      {/* Fade the ends so logos enter and leave rather than being cut off. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <ul
        className="logo-marquee-track flex w-max items-center gap-12 md:gap-16"
        style={{
          animationDuration: `${seconds}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((copy) =>
          items.map((it) => (
            <li key={`${copy}-${it.name}`} className="shrink-0">
              <img
                src={it.src}
                alt={copy === 0 ? it.name : ""}
                aria-hidden={copy === 1}
                loading="lazy"
                className={
                  "w-auto object-contain opacity-90 transition duration-300 hover:opacity-100 hover:scale-105 " +
                  height
                }
              />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

export function HomeClients() {
  return (
    <section className="border-b border-border bg-background">
      <div className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <Reveal className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Trusted by businesses across India
            </h2>
            <span className="mono text-[11px] text-muted-foreground/70">
              Pharma · Software · Healthcare · Education · Housing
            </span>
          </Reveal>
        </div>

        <div className="mt-8">
          <Marquee items={CLIENTS} seconds={58} height="h-11 md:h-12" />
        </div>

      </div>
    </section>
  );
}
