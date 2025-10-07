export const getCssVar = (name: string, fallback: string) => {
  if (typeof window !== "undefined") {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    );
  }
  return fallback;
};
