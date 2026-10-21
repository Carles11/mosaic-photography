// utils/clean-content.ts
export const getHumanReadableBiography = (md: string) => {
  if (!md) return "";
  const parts = md.split("#### 🔍 AI-Search & GEO Context");
  // Always return the first part (the narrative), and ensure we clean up trailing newlines
  return parts[0].trim();
};

/**
 * Remove a leading Markdown heading line (e.g. "# Mathew Brady (1822–1896)").
 * Pages that already render the name as their H1 must not repeat it.
 */
export const stripLeadingHeading = (md: string): string => {
  if (!md) return "";
  return md.replace(/^#{1,6}[^\n]*\n+/, "").trim();
};

/**
 * Plain text from a Markdown-ish string: no heading marks, no emphasis
 * markers, no link syntax. Used for meta descriptions and JSON-LD, where
 * raw Markdown is noise for crawlers and AI engines.
 */
export const markdownToPlainText = (md: string): string =>
  stripLeadingHeading(md)
    .replace(/\*\*|__/g, "")
    .replace(/[*_`#]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Cut a text to `maxLength` characters, preferring a sentence end so the
 * result never reads as a truncated sentence. Falls back to a word boundary.
 */
export const cutAtSentenceEnd = (text: string, maxLength: number): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const sentence = slice.match(/^[\s\S]*[.!?]["'”’)\]]*(\s|$)/);
  if (sentence) return sentence[0].trim();
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
};

/** First sentence of a plain-text string. */
export const getFirstSentence = (text: string): string => {
  if (!text) return "";
  const sentence = text.match(/^[\s\S]*?[.!?]["'”’)\]]*(\s|$)/);
  return sentence ? sentence[0].trim() : text;
};

/** Trim to `maxLength` characters without cutting a word in half. */
export const trimToWordBoundary = (text: string, maxLength: number): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
};

/**
 * Clean a value straight from the database: drop zero-width characters
 * (some `origin` values carry a U+200B) and trim the surrounding spaces.
 */
export const cleanText = (value?: string | null): string =>
  (value ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

