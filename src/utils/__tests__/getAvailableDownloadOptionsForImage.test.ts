import { getAvailableDownloadOptionsForImage } from "@/utils/getAvailableDownloadOptionsForImage";

describe("getAvailableDownloadOptionsForImage", () => {
  it("builds expected webp and original options for known width", () => {
    const options = getAvailableDownloadOptionsForImage({
      base_url: "https://cdn.example.com/author-x",
      filename: "photo-001.jpg",
      width: 1600,
      print_quality: "professional",
    });

    expect(options).toHaveLength(7);
    expect(options[0]).toMatchObject({
      folder: "w400",
      format: "webp",
      isOriginal: false,
      url: "https://cdn.example.com/author-x/w400/photo-001.webp",
    });

    expect(options[5]).toMatchObject({
      folder: "originalsWEBP",
      format: "webp",
      isOriginal: false,
      width: 1600,
    });

    expect(options[6]).toMatchObject({
      folder: "originals",
      format: "jpg",
      isOriginal: true,
      width: 1600,
      url: "https://cdn.example.com/author-x/originals/photo-001.jpg",
    });
    expect(options[6].label).toContain("Best for print");
  });

  it("returns only originalsWEBP and originals when width is below first bucket", () => {
    const options = getAvailableDownloadOptionsForImage({
      base_url: "https://cdn.example.com/author-y",
      filename: "tiny.png",
      width: 300,
    });

    expect(options).toHaveLength(2);
    expect(options[0].folder).toBe("originalsWEBP");
    expect(options[1].folder).toBe("originals");
  });

  it("returns empty array when base_url or filename is missing", () => {
    expect(
      getAvailableDownloadOptionsForImage({ filename: "x.jpg", width: 800 }),
    ).toEqual([]);

    expect(
      getAvailableDownloadOptionsForImage({
        base_url: "https://cdn.example.com/x",
        width: 800,
      }),
    ).toEqual([]);
  });

  it("falls back to safe defaults for unknown width and normalizes trailing slash", () => {
    const options = getAvailableDownloadOptionsForImage({
      base_url: "https://cdn.example.com/author-z/",
      filename: "capture",
      width: undefined,
    });

    const originalOption = options[options.length - 1];

    expect(originalOption.width).toBe(1920);
    expect(originalOption.url).toBe(
      "https://cdn.example.com/author-z/originals/capture",
    );
    expect(originalOption.label).toContain("1920w");
    expect(originalOption.format).toBe("jpg");
  });
});
