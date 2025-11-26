// Parses hash params from the URL, e.g. "#access_token=123&type=magiclink"
export function parseHashParams(hash: string): Record<string, string> {
  const clean = hash.replace(/^#\/?|\?/, "");
  if (!clean) return {};
  return clean.split("&").reduce((acc, part) => {
    const [key, val] = part.split("=");
    if (key) acc[key] = decodeURIComponent(val || "");
    return acc;
  }, {} as Record<string, string>);
}
