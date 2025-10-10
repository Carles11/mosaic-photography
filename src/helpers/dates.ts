export function formatLifespan(birthIso: string, deathIso: string): string {
  if (!birthIso && !deathIso) return "";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Helper to format or fallback to empty
  const format = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(undefined, options) : "";

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
