// Simple slugify helper for names/surnames
export function slugify(str: string): string {
  return str
    .normalize("NFD") // split accented chars
    .replace(/\p{Diacritic}/gu, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanum with dash
    .replace(/^-+|-+$/g, "") // trim dashes
    .replace(/--+/g, "-"); // collapse multiple dashes
}
