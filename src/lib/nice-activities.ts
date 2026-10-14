/**
 * Business activity -> Nice trade mark classes, for the trade mark screening.
 *
 * A mark only blocks a company name in the SAME class, and a closely related class is a caution,
 * so the check needs to know which classes a business falls in. The applicant picks what the
 * company will mainly do; this turns that into its own class first, then the related ones
 * (the spec's examples: pharmaceuticals -> 5, plus 35, 42, 44; film production -> 41, plus 9, 35;
 * hospitality and F&B -> 43, plus 29, 30, 32, 35).
 *
 * This is a starting list kept in code. The spec asks for it to become an admin-editable table;
 * until then, extend it here. The first class is always the business's own.
 */
export type Activity = { id: string; label: string; classes: number[] };

export const ACTIVITIES: Activity[] = [
  { id: "it", label: "IT, software & technology", classes: [42, 9, 35, 41] },
  { id: "ecommerce", label: "E-commerce & retail trading", classes: [35, 9, 39] },
  { id: "pharma", label: "Pharmaceuticals", classes: [5, 35, 42, 44] },
  { id: "healthcare", label: "Healthcare & clinics", classes: [44, 5, 10, 35] },
  { id: "food", label: "Restaurants, hospitality & food service", classes: [43, 29, 30, 32, 35] },
  { id: "foodmfg", label: "Food products & packaged foods", classes: [29, 30, 31, 35, 43] },
  { id: "beverages", label: "Beverages", classes: [32, 33, 35, 43] },
  { id: "apparel", label: "Clothing, apparel & footwear", classes: [25, 35, 18, 24] },
  { id: "textiles", label: "Textiles & fabrics", classes: [24, 23, 25, 35] },
  { id: "jewellery", label: "Jewellery & watches", classes: [14, 35, 18] },
  { id: "cosmetics", label: "Cosmetics & personal care", classes: [3, 35, 5, 44] },
  { id: "education", label: "Education & training", classes: [41, 9, 16, 35] },
  { id: "media", label: "Film, media & entertainment", classes: [41, 9, 35] },
  { id: "advertising", label: "Advertising & marketing", classes: [35, 41, 38, 42] },
  { id: "consulting", label: "Consulting & professional services", classes: [35, 36, 41, 42] },
  { id: "finance", label: "Finance, insurance & investments", classes: [36, 35, 9, 42] },
  { id: "realestate", label: "Real estate & property", classes: [36, 37, 35, 42] },
  { id: "construction", label: "Construction & building materials", classes: [37, 19, 6, 35] },
  { id: "logistics", label: "Logistics, transport & travel", classes: [39, 35, 42, 12] },
  { id: "telecom", label: "Telecom & internet services", classes: [38, 9, 42, 35] },
  { id: "automotive", label: "Automobiles & spare parts", classes: [12, 7, 37, 35] },
  { id: "machinery", label: "Machinery & industrial equipment", classes: [7, 8, 37, 42, 35] },
  { id: "electronics", label: "Electronics & electricals", classes: [9, 11, 35, 42] },
  { id: "furniture", label: "Furniture & home goods", classes: [20, 21, 24, 35] },
  { id: "toys", label: "Toys, games & sports goods", classes: [28, 35, 41, 9] },
  { id: "agri", label: "Agriculture & farm produce", classes: [31, 1, 35, 44] },
  { id: "chemicals", label: "Chemicals, paints & plastics", classes: [1, 2, 17, 35] },
  { id: "paper", label: "Paper, printing & stationery", classes: [16, 35, 40, 41] },
];

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);
