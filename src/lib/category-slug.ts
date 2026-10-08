/** URL segment for a catalog category, e.g. "Entity Registration" -> "entity-registration". */
export const categorySlug = (label: string) =>
  label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
