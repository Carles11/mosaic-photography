// utils/clean-content.ts
export const getHumanReadableBiography = (md: string) => {
  if (!md) return "";
  const parts = md.split("#### 🔍 AI-Search & GEO Context");
  // Always return the first part (the narrative), and ensure we clean up trailing newlines
  return parts[0].trim();
};
