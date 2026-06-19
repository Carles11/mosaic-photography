import { handleDownloadOptionClick } from "../handleDownloadOptionClick";
import type { DownloadOption } from "../getAvailableDownloadOptionsForImage";

const mockOption: DownloadOption = {
  url: "https://cdn.example.com/w800/photo.webp",
  label: "800px WebP",
  folder: "w800",
  format: "webp",
};

function makeParams(
  overrides?: Partial<Parameters<typeof handleDownloadOptionClick>[0]>,
): Parameters<typeof handleDownloadOptionClick>[0] {
  return {
    option: mockOption,
    user: null,
    originalFilename: "photo.jpg",
    eventName: "downloadClicked",
    onRequireLogin: jest.fn(),
    trackEvent: jest.fn(),
    onErrorFallback: jest.fn(),
    ...overrides,
  };
}

describe("handleDownloadOptionClick", () => {
  let mockAnchor: HTMLAnchorElement;
  let createElementSpy: jest.SpyInstance;
  let fetchSpy: jest.Mock;
  let createObjectUrlSpy: jest.Mock;

  beforeEach(() => {
    mockAnchor = {
      href: "",
      download: "",
      target: "",
      rel: "",
      click: jest.fn(),
      remove: jest.fn(),
    } as unknown as HTMLAnchorElement;

    createElementSpy = jest
      .spyOn(document, "createElement")
      .mockReturnValue(mockAnchor);

    jest
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => mockAnchor);

    fetchSpy = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["ok"], { type: "image/webp" }),
    } as Response);
    (globalThis as { fetch?: typeof fetch }).fetch =
      fetchSpy as unknown as typeof fetch;

    createObjectUrlSpy = jest.fn(() => "blob:mock-download-url");
    const urlApi = URL as unknown as {
      createObjectURL?: (obj: Blob) => string;
      revokeObjectURL?: (url: string) => void;
    };
    urlApi.createObjectURL = createObjectUrlSpy;
    urlApi.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls onRequireLogin and trackEvent when user is null, does not trigger download", async () => {
    const params = makeParams({ user: null });
    await handleDownloadOptionClick(params);

    expect(params.onRequireLogin).toHaveBeenCalledTimes(1);
    expect(params.trackEvent).toHaveBeenCalledWith(
      "downloadClicked",
      mockOption.url,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createElementSpy).not.toHaveBeenCalled();
    expect(params.onErrorFallback).not.toHaveBeenCalled();
  });

  it("triggers browser download and tracks event when user is authenticated", async () => {
    const params = makeParams({ user: { id: "user-1" } });
    await handleDownloadOptionClick(params);

    expect(params.onRequireLogin).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(mockOption.url);
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockAnchor.click).toHaveBeenCalledTimes(1);
    expect(params.trackEvent).toHaveBeenCalledWith(
      "downloadClicked",
      mockOption.url,
    );
    expect(params.onErrorFallback).not.toHaveBeenCalled();
  });

  it("builds a suggested filename from originalFilename and option folder/format", async () => {
    const params = makeParams({ user: { id: "user-1" } });
    await handleDownloadOptionClick(params);

    expect(mockAnchor.download).toBe("photo_w800.webp");
  });

  it("calls onErrorFallback and falls back to proxy download when blob download fails", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("network fail"));

    const params = makeParams({ user: { id: "user-1" } });
    await handleDownloadOptionClick(params);

    expect(params.onErrorFallback).toHaveBeenCalledWith(expect.any(Error));
    // Fallback path: creates anchor with proxy URL and download attribute
    expect(createElementSpy).toHaveBeenCalledTimes(1);
    expect(mockAnchor.download).toBe("photo_w800.webp");
    expect(mockAnchor.href).toContain("/api/download-image");
    expect(mockAnchor.href).toContain(encodeURIComponent(mockOption.url));
  });
});
