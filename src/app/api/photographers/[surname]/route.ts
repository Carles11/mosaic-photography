import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "nodejs";
// Cache for 1 hour — biography content changes rarely
export const revalidate = 3600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ surname: string }> },
) {
  const { surname } = await params;

  // Strip .md suffix if the rewrite left it in (safety net)
  const slug = surname.replace(/\.md$/, "").toLowerCase();

  const { data: photographer, error } = await supabaseServerClient
    .from("photographers")
    .select(
      "name, surname, biography_md, intro_md, birthdate, deceasedate, origin, slug",
    )
    .eq("slug", slug)
    .single();

  if (error || !photographer) {
    return new NextResponse(
      `# Not Found\n\nNo photographer found for: ${slug}`,
      {
        status: 404,
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      },
    );
  }

  const {
    name,
    surname: lastName,
    biography_md,
    intro_md,
    birthdate,
    deceasedate,
    origin,
  } = photographer;

  // Dates are stored as ISO strings (e.g. "1864-01-01T00:00:00+00:00").
  // Extract just the year for human-readable output.
  const parseYear = (raw: string | null | undefined): string => {
    if (!raw) return "Unknown";
    const match = raw.match(/^(\d{4})/);
    return match ? match[1] : raw;
  };

  const birthYear = parseYear(birthdate);
  const deathYear = deceasedate ? parseYear(deceasedate) : null;
  const lifespan = deathYear
    ? `${birthYear} – ${deathYear}`
    : `b. ${birthYear}`;

  const markdown = [
    `# ${name} ${lastName}`,
    ``,
    `**Origin:** ${origin ?? "Unknown"}  `,
    `**Life:** ${lifespan}  `,
    `**Profile page:** https://www.mosaic.photography/photographers/${slug}  `,
    `**License:** All photographs in the public domain (CC PDM 1.0) — https://creativecommons.org/publicdomain/mark/1.0/`,
    ``,
    // intro_md already contains its own heading — render it directly, no wrapper
    intro_md ? `${intro_md}\n` : "",
    biography_md ? `## Biography\n\n${biography_md}\n` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex", // don't double-index; the main page is already indexed
    },
  });
}
