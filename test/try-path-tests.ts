import { assert } from "chai";
import { getPathsToTry } from "../src/try-path";

describe("mapping-entry", () => {
  const abosolutePathMappings = [
    {
      pattern: "longest/pre/fix/*",
      paths: ["/absolute/base/url/foo2/bar"]
    },
    { pattern: "pre/fix/*", paths: ["/absolute/base/url/foo3"] },
    { pattern: "*", paths: ["/absolute/base/url/foo1"] }
  ];
  it("should return no paths for relative requested module", () => {
    const result = getPathsToTry(
      [".ts", "tsx"],
      abosolutePathMappings,
      "./requested-module"
    );
    assert.deepEqual(result, undefined);
  });

  it("should return no paths if no pattern match the requested module", () => {
    const result = getPathsToTry(
      [".ts", "tsx"],
      [
        {
          pattern: "longest/pre/fix/*",
          paths: ["/absolute/base/url/foo2/bar"]
        },
        { pattern: "pre/fix/*", paths: ["/absolute/base/url/foo3"] }
      ],
      "requested-module"
    );
    assert.deepEqual(result, undefined);
  });

  it("should get all paths that matches requested module", () => {
    const result = getPathsToTry(
      [".ts", ".tsx"],
      abosolutePathMappings,
      "longest/pre/fix/requested-module"
    );
    assert.deepEqual(result, [
      // "longest/pre/fix/*"
      { type: "file", path: "/absolute/base/url/foo2/bar" },
      { type: "file", path: "/absolute/base/url/foo2/bar.ts" },
      { type: "file", path: "/absolute/base/url/foo2/bar.tsx" },
      { type: "package", path: "/absolute/base/url/foo2/bar/package.json" },
      { type: "file", path: "/absolute/base/url/foo2/bar/index.ts" },
      { type: "file", path: "/absolute/base/url/foo2/bar/index.tsx" },
      // "*"
      { type: "file", path: "/absolute/base/url/foo1" },
      { type: "file", path: "/absolute/base/url/foo1.ts" },
      { type: "file", path: "/absolute/base/url/foo1.tsx" },
      { type: "package", path: "/absolute/base/url/foo1/package.json" },
      { type: "file", path: "/absolute/base/url/foo1/index.ts" },
      { type: "file", path: "/absolute/base/url/foo1/index.tsx" }
    ]);
  });
});
