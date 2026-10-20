/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "../route";

function call(url: string) {
  return GET(
    new NextRequest(
      `http://localhost/api/download-image?url=${encodeURIComponent(url)}&filename=a%22b.webp`,
    ),
  );
}

describe("GET /api/download-image", () => {
  afterEach(() => jest.restoreAllMocks());

  it("proxies a valid CDN URL without following redirects", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response("img", { headers: { "Content-Type": "image/webp" } }),
      );
    const res = await call(
      "https://cdn.mosaic.photography/mosaic-collections/x/w800/a.webp",
    );
    expect(res.status).toBe(200);
    expect(fetchSpy.mock.calls[0][1]).toEqual({ redirect: "error" });
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="ab.webp"',
    );
  });

  it.each([
    "https://cdn.mosaic.photography.evil.com/x",
    "http://cdn.mosaic.photography/x",
    "not a url",
  ])("rejects %s", async (url) => {
    const fetchSpy = jest.spyOn(global, "fetch");
    const res = await call(url);
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 502 when the CDN fetch throws", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("redirect"));
    const res = await call("https://cdn.mosaic.photography/x.webp");
    expect(res.status).toBe(502);
  });
});
