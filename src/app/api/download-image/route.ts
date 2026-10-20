import { NextRequest, NextResponse } from "next/server";

const CDN_HOSTNAME = "cdn.mosaic.photography";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "download";

  let target: URL;
  try {
    target = new URL(url ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (target.protocol !== "https:" || target.hostname !== CDN_HOSTNAME) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let response: Response;
  try {
    // redirect: "error" so the CDN can't bounce us to another host
    response = await fetch(target, { redirect: "error" });
  } catch {
    return NextResponse.json({ error: "CDN fetch failed" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `CDN returned ${response.status}` },
      { status: response.status },
    );
  }

  const contentType =
    response.headers.get("Content-Type") || "application/octet-stream";
  const safeFilename = filename.replace(/["\r\n]/g, "");
  const disposition = `attachment; filename="${encodeURIComponent(safeFilename)}"`;

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=0",
    },
  });
}
