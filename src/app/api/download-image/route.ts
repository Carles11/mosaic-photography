import { NextRequest, NextResponse } from "next/server";

const CDN_DOMAIN = "https://cdn.mosaic.photography";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "download";

  if (!url || !url.startsWith(CDN_DOMAIN)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const response = await fetch(url);

  if (!response.ok) {
    return NextResponse.json(
      { error: `CDN returned ${response.status}` },
      { status: response.status },
    );
  }

  const contentType =
    response.headers.get("Content-Type") || "application/octet-stream";
  const disposition = `attachment; filename="${encodeURIComponent(filename)}"`;

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=0",
    },
  });
}
