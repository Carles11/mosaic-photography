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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls onRequireLogin and trackEvent when user is null, does not trigger download", () => {
    const params = makeParams({ user: null });
    handleDownloadOptionClick(params);

    expect(params.onRequireLogin).toHaveBeenCalledTimes(1);
    expect(params.trackEvent).toHaveBeenCalledWith(
      "downloadClicked",
      mockOption.url,
    );
    expect(createElementSpy).not.toHaveBeenCalled();
    expect(params.onErrorFallback).not.toHaveBeenCalled();
  });

  it("triggers browser download and tracks event when user is authenticated", () => {
    const params = makeParams({ user: { id: "user-1" } });
    handleDownloadOptionClick(params);

    expect(params.onRequireLogin).not.toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockAnchor.click).toHaveBeenCalledTimes(1);
    expect(params.trackEvent).toHaveBeenCalledWith(
      "downloadClicked",
      mockOption.url,
    );
    expect(params.onErrorFallback).not.toHaveBeenCalled();
  });

  it("builds a suggested filename from originalFilename and option folder/format", () => {
    const params = makeParams({ user: { id: "user-1" } });
    handleDownloadOptionClick(params);

    expect(mockAnchor.download).toBe("photo_w800.webp");
  });

  it("calls onErrorFallback and falls back to tab-open when download throws", () => {
    createElementSpy
      .mockImplementationOnce(() => {
        throw new Error("DOM error");
      })
      .mockReturnValue(mockAnchor);

    const params = makeParams({ user: { id: "user-1" } });
    handleDownloadOptionClick(params);

    expect(params.onErrorFallback).toHaveBeenCalledWith(expect.any(Error));
    // Fallback path: called again without filename → target="_blank"
    expect(createElementSpy).toHaveBeenCalledTimes(2);
    expect(mockAnchor.target).toBe("_blank");
  });
});
