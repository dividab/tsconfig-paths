import { assert } from "chai";
import { createMatchPath } from "../src/match-path";

describe('find-path', function () {

  it('should locate path that matches with star and exists', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/mylib/index.ts"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should resolve to correct path when many are specified', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/*": ["foo1/*", "foo2/*","location/*", "foo3/*"] });
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

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "*": ["location/*"], "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/lib/mylib" || "/root/location/mylib"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should locate path that matches with star and exists with extension', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/*": ["location/*"] });
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

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/foo": ["location/foo"] });
    const result = matchPath(
      "/root/test.ts",
      "lib/foo",
      (_: string) => undefined,
      (name: string) => name === "/root/location/foo.ts"
    );
    assert.equal(result, "/root/location/foo");
  });

  it('should resolve to parent folder when filename is in subfolder', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/subfolder/file.ts",
      "lib/mylib",
      (_: string) => undefined,
      (name: string) => name === "/root/location/mylib/index.ts"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should resolve from main field in package.json', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/subfolder/file.ts",
      "lib/mylib",
      (_: string) => ({ main: "./kalle.ts" }),
      (name: string) => name === "/root/location/mylib/kalle.ts"
    );
    assert.equal(result, "/root/location/mylib/kalle");
  });

  it('should not locate path that does not match', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", { "lib/*": ["location/*"] });
    const result = matchPath(
      "/root/asd.ts",
      "mylib",
      (_: string) => undefined,
      (name: string) => name === "root/location/mylib");
    assert.equal(result, undefined);
  });

});
