import { assert } from "chai";
import { getAbsoluteMappingEntries } from "../src/mapping-entry";
import { join } from "path";

describe("mapping-entry", () => {
  it("should change to absolute paths and sort in longest prefix order", () => {
    const result = getAbsoluteMappingEntries("/absolute/base/url", {
      "*": ["/foo1", "/foo2"],
      "longest/pre/fix/*": ["/foo2/bar"],
      "pre/fix/*": ["/foo3"]
    });
    assert.deepEqual(result, [
      {
        pattern: "longest/pre/fix/*",
        paths: [join("/absolute", "base", "url", "foo2", "bar")]
      },
      {
        pattern: "pre/fix/*",
        paths: [join("/absolute", "base", "url", "foo3")]
      },
      {
        pattern: "*",
        paths: [
          join("/absolute", "base", "url", "foo1"),
          join("/absolute", "base", "url", "foo2")
        ]
      }
    ]);
  });
});
