export function formatLifespan(birthIso: string, deathIso: string): string {
  if (!birthIso && !deathIso) return "";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Always format dates in English (US)
  const format = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", options) : "";

  if (birthIso && deathIso) {
    return `${format(birthIso)} – ${format(deathIso)}`;
  }
  if (birthIso) {
    return `Born ${format(birthIso)}`;
  }
  if (deathIso) {
    return `Died ${format(deathIso)}`;
  }
  return "";
}

/** Year of an ISO timestamp, or undefined when missing or unparseable. */
export function getYear(iso?: string | null): number | undefined {
  if (!iso) return undefined;
  const year = Number.parseInt(iso.slice(0, 4), 10);
  return Number.isFinite(year) && year > 0 ? year : undefined;
}

/**
 * "1822–1896" when both years are known, an empty string otherwise.
 * Partial ranges are not shown: a life span needs both ends.
 */
export function formatYearRange(
  birthYear?: number,
  deathYear?: number,
): string {
  if (!birthYear || !deathYear) return "";
  return `${birthYear}–${deathYear}`;
}

/** ISO date (YYYY-MM-DD) from a timestamp that may carry a time zone. */
export function toIsoDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const date = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

export const formatHumanDate = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
