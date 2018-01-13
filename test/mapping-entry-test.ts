import { assert } from "chai";
import { getAbsoluteMappingEntries } from "../src/mapping-entry";

describe("mapping-entry", () => {
  it("should change to absolute paths and sort in longest prefix order", () => {
    const result = getAbsoluteMappingEntries("/absolute/base/url", {
      "*": ["/foo1", "/foo2"],
      "longest/pre/fix/*": ["/foo2/bar"],
      "pre/fix/*": ["/foo3"]
    });
    assert.deepEqual(result, [
      { pattern: "longest/pre/fix/*", paths: ["/absolute/base/url/foo2/bar"] },
      { pattern: "pre/fix/*", paths: ["/absolute/base/url/foo3"] },
      {
        pattern: "*",
        paths: ["/absolute/base/url/foo1", "/absolute/base/url/foo2"]
      }
    ]);
  });
});
