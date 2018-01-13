import { assert } from "chai";
import { createMatchPath } from "../src/match-path-sync";
import { join, dirname } from "path";
import { removeExtension } from "../src/filesystem";

describe("match-path-sync", () => {
  it("should locate path that matches with star and exists", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylib", "index.ts");
    const result = matchPath(
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === existingPath
    );
    assert.equal(result, dirname(existingPath));
  });

  it("should resolve to correct path when many are specified", () => {
    const matchPath = createMatchPath("/root/", {
      "lib/*": ["foo1/*", "foo2/*", "location/*", "foo3/*"]
    });
    const existingPath = join("/root", "location", "mylib", "index.ts");
    const result = matchPath(
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === existingPath,
      [".ts"]
    );
    assert.equal(result, dirname(existingPath));
  });

  it("should locate path that matches with star and prioritize pattern with longest prefix", () => {
    const matchPath = createMatchPath("/root/", {
      "*": ["location/*"],
      "lib/*": ["location/*"]
    });
    const existingPath1 = join("/root", "location", "lib", "mylib", "index.ts");
    const existingPath2 = join("/root", "location", "mylib", "index.ts");
    const result = matchPath(
      "lib/mylib",
      undefined,
      (name: string) => name === existingPath1 || name === existingPath2
    );
    assert.equal(result, dirname(existingPath2));
  });

  it("should locate path that matches with star and exists with extension", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylib.myext");
    const result = matchPath(
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === existingPath,
      [".js", ".myext"]
    );
    assert.equal(result, removeExtension(existingPath));
  });

  it("should resolve request with extension specified", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "test.jpg");
    const result = matchPath(
      "lib/test.jpg",
      (_: string) => undefined,
      (name: string) => name === existingPath,
      [".js", ".myext"]
    );
    assert.equal(result, existingPath);
  });

  it("should locate path that matches without star and exists", () => {
    const matchPath = createMatchPath("/root/", {
      "lib/foo": ["location/foo"]
    });
    const existingPath = join("/root", "location", "foo.ts");
    const result = matchPath(
      "lib/foo",
      (_: string) => undefined,
      (name: string) => name === existingPath
    );
    assert.equal(result, removeExtension(existingPath));
  });

  it("should resolve to parent folder when filename is in subfolder", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylib", "index.ts");
    const result = matchPath(
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === existingPath
    );
    assert.equal(result, dirname(existingPath));
  });

  it("should resolve from main field in package.json", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylib", "kalle.ts");
    const result = matchPath(
      "lib/mylib",
      (_: string) => ({ main: "./kalle.ts" }),
      (name: string) => name === existingPath
    );
    assert.equal(result, removeExtension(existingPath));
  });

  it("should resolve from main field in package.json", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylib.js", "kalle.js");
    const result = matchPath(
      "lib/mylib.js",
      (_: string) => ({ main: "./kalle.js" }),
      (name: string) => name === existingPath,
      [".ts", ".js"]
    );

    assert.equal(result, removeExtension(existingPath));
  });

  it("should resolve from main field in package.json and correctly remove file extension", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylibjs", "kallejs");
    // Make sure we escape the "."
    const result = matchPath(
      "lib/mylibjs",
      (_: string) => ({ main: "./kallejs" }),
      (name: string) => name === existingPath,
      [".ts", ".js"]
    );

    assert.equal(result, existingPath);
  });

  it("should resolve to with the help of baseUrl when not explicitly set", () => {
    const matchPath = createMatchPath("/root/", {});
    const existingPath = join("/root", "mylib", "index.ts");
    const result = matchPath(
      "mylib",
      (_: string) => undefined,
      (name: string) => name === existingPath
    );
    assert.equal(result, dirname(existingPath));
  });

  it("should not locate path that does not match", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("root", "location", "mylib");
    const result = matchPath(
      "mylib",
      (_: string) => undefined,
      (name: string) => name === existingPath
    );
    assert.equal(result, undefined);
  });
});
