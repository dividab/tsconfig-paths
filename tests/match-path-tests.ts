import { assert } from "chai";
import { createMatchPath } from "../src/match-path";

describe('find-path', function () {

  it('should locate path that matches with star and exists', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/mylib/index.ts"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should resolve to correct path when many are specified', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["foo1/*", "foo2/*","location/*", "foo3/*"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/mylib/index.ts",
      [".ts"]
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should locate path that matches with star and prioritize pattern with longest prefix', () => {

    const matchPath = createMatchPath("/root/", { "*": ["location/*"], "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/lib/mylib" || "/root/location/mylib"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should locate path that matches with star and exists with extension', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/mylib.myext",
      [".js", ".myext"]
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should locate path that matches without star and exists', () => {

    const matchPath = createMatchPath("/root/", { "lib/foo": ["location/foo"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/foo",
      (_: string) => undefined,
      (name: string) => name === "/root/location/foo.ts"
    );
    assert.equal(result, "/root/location/foo");
  });

  it('should resolve to parent folder when filename is in subfolder', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/subfolder/file.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/mylib/index.ts"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should resolve from main field in package.json', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/subfolder/file.ts",
      "lib/mylib",
      (_: string) => ({ main: "./kalle.ts" }),
      (name: string) => name === "/root/location/mylib/kalle.ts"
    );
    assert.equal(result, "/root/location/mylib/kalle");
  });

  it('should resolve from main field in package.json and correctly remove file extension', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/subfolder/file.js",
      "lib/mylib.js",
      (_: string) => ({ main: "./kalle.js" }),
      (name: string) => name === "/root/location/mylib.js/kalle.js",
      [".ts", ".js"]
    );

    // Make sure we escape the "."
    const result2 = matchPath(
      "/root/subfolder/file.js",
      "lib/mylibjs",
      (_: string) => ({ main: "./kallejs" }),
      (name: string) => name === "/root/location/mylibjs/kallejs",
      [".ts", ".js"]
    );

    assert.equal(result, "/root/location/mylib.js/kalle");
    assert.equal(result2, "/root/location/mylibjs/kallejs");
  });

  it('should not locate path that does not match', () => {

    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/asd.ts",
      "mylib",
      (_: string) => undefined,
      (name: string) => name === "root/location/mylib");
    assert.equal(result, undefined);
  });

});
