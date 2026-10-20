import { serializeJsonLd } from "../jsonLd";

describe("serializeJsonLd", () => {
  it("escapes markup and round-trips through JSON.parse", () => {
    const data = { a: "</script><script>x", b: "Tom & Jerry" };
    const out = serializeJsonLd(data);
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)).toEqual(data);
  });
});
