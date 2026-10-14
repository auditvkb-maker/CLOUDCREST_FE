import { useEffect, useState } from "react";

/**
 * Business activity -> Nice trade mark classes, for the trade mark screening.
 *
 * A mark only blocks a company name in the SAME class, and a closely related class is a caution,
 * so the check needs to know which classes a business falls in. The applicant picks what the
 * company will mainly do, or types a NIC code, and this turns that into its own class first, then
 * the related ones (the spec's examples: pharmaceuticals -> 5, plus 35, 42, 44; film production ->
 * 41, plus 9, 35; hospitality and F&B -> 43, plus 29, 30, 32, 35).
 *
 * The list lives in the database and an admin edits it (Admin console -> Trade mark classes). The
 * copy below is only a fallback for when the API cannot be reached, so the check still works.
 */
export type Activity = {
  id: number | string;
  label: string;
  /** The business's own class first, then the related ones. */
  classes: number[];
  /** NIC 2008 code prefixes that map to this activity, e.g. "62" covers 6201, 6209... */
  nicPrefixes: string[];
};

const FALLBACK: Omit<Activity, "id">[] = [
  { label: "IT, software & technology", classes: [42, 9, 35, 41], nicPrefixes: ["62", "63", "5820"] },
  { label: "E-commerce & retail trading", classes: [35, 9, 39], nicPrefixes: ["47", "46"] },
  { label: "Pharmaceuticals", classes: [5, 35, 42, 44], nicPrefixes: ["21"] },
  { label: "Healthcare & clinics", classes: [44, 5, 10, 35], nicPrefixes: ["86", "87"] },
  { label: "Restaurants, hospitality & food service", classes: [43, 29, 30, 32, 35], nicPrefixes: ["56", "55"] },
  { label: "Food products & packaged foods", classes: [29, 30, 31, 35, 43], nicPrefixes: ["10"] },
  { label: "Beverages", classes: [32, 33, 35, 43], nicPrefixes: ["11"] },
  { label: "Clothing, apparel & footwear", classes: [25, 35, 18, 24], nicPrefixes: ["14", "1520"] },
  { label: "Textiles & fabrics", classes: [24, 23, 25, 35], nicPrefixes: ["13"] },
  { label: "Jewellery & watches", classes: [14, 35, 18], nicPrefixes: ["321", "2652"] },
  { label: "Cosmetics & personal care", classes: [3, 35, 5, 44], nicPrefixes: ["2023", "9602"] },
  { label: "Education & training", classes: [41, 9, 16, 35], nicPrefixes: ["85"] },
  { label: "Film, media & entertainment", classes: [41, 9, 35], nicPrefixes: ["59", "60", "90"] },
  { label: "Advertising & marketing", classes: [35, 41, 38, 42], nicPrefixes: ["73"] },
  { label: "Consulting & professional services", classes: [35, 36, 41, 42], nicPrefixes: ["69", "70", "71", "74"] },
  { label: "Finance, insurance & investments", classes: [36, 35, 9, 42], nicPrefixes: ["64", "65", "66"] },
  { label: "Real estate & property", classes: [36, 37, 35, 42], nicPrefixes: ["68"] },
  { label: "Construction & building materials", classes: [37, 19, 6, 35], nicPrefixes: ["41", "42", "43"] },
  { label: "Logistics, transport & travel", classes: [39, 35, 42, 12], nicPrefixes: ["49", "50", "51", "52", "53", "79"] },
  { label: "Telecom & internet services", classes: [38, 9, 42, 35], nicPrefixes: ["61"] },
  { label: "Automobiles & spare parts", classes: [12, 7, 37, 35], nicPrefixes: ["29", "45"] },
  { label: "Machinery & industrial equipment", classes: [7, 8, 37, 42, 35], nicPrefixes: ["28", "25"] },
  { label: "Electronics & electricals", classes: [9, 11, 35, 42], nicPrefixes: ["26", "27"] },
  { label: "Furniture & home goods", classes: [20, 21, 24, 35], nicPrefixes: ["31"] },
  { label: "Toys, games & sports goods", classes: [28, 35, 41, 9], nicPrefixes: ["3240", "3230"] },
  { label: "Agriculture & farm produce", classes: [31, 1, 35, 44], nicPrefixes: ["01", "02", "03"] },
  { label: "Chemicals, paints & plastics", classes: [1, 2, 17, 35], nicPrefixes: ["20", "22"] },
  { label: "Paper, printing & stationery", classes: [16, 35, 40, 41], nicPrefixes: ["17", "18"] },
];

const FALLBACK_ACTIVITIES: Activity[] = FALLBACK.map((a, i) => ({ ...a, id: `built-in-${i}` }));

const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

let cache: Activity[] | null = null;
let inflight: Promise<Activity[]> | null = null;

function loadActivities(): Promise<Activity[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= fetch(`${BACKEND}/api/trademarks/activities`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((rows: Activity[]) => (cache = rows.length ? rows : FALLBACK_ACTIVITIES))
    .catch(() => (cache = FALLBACK_ACTIVITIES))
    .finally(() => (inflight = null));
  return inflight;
}

/** The activity list: the built-in one at once, replaced by the live one as soon as it arrives. */
export function useActivities(): Activity[] {
  const [list, setList] = useState<Activity[]>(cache ?? FALLBACK_ACTIVITIES);
  useEffect(() => {
    let alive = true;
    loadActivities().then((a) => alive && setList(a));
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

/**
 * The activity a NIC code belongs to, by the longest matching prefix ("6201" matches a "62" row
 * unless another row claims "620" or "6201"). Null when the code is too short or matches nothing.
 */
export function activityForNic(code: string, list: Activity[]): Activity | null {
  const digits = code.replace(/\D/g, "");
  if (digits.length < 2) return null;
  let best: { a: Activity; len: number } | null = null;
  for (const a of list) {
    for (const p of a.nicPrefixes) {
      if (digits.startsWith(p) && (!best || p.length > best.len)) best = { a, len: p.length };
    }
  }
  return best?.a ?? null;
}
