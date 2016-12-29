import { assert } from "chai";
import { findPath } from "../src/find-path";
import * as path from "path";

describe('find-path', function () {

  it('should locate path that matches and exists', () => {

    const result = findPath({
      sourceFileName: "./test.ts",
      request: "lib/mylib",
      absoluteBaseUrl: path.resolve("./"),
      paths: { "lib/*": ["location/*"] },
      fileExists: (name: string) => name === path.resolve("./", "location/mylib")
    });
    assert.equal(result, "./location/mylib");
  });

  it('should resolve to parent folder when filename is in subfolder', () => {

    const result = findPath({
      sourceFileName: "./subfolder/file.ts",
      request: "lib/mylib",
      absoluteBaseUrl: path.resolve("./"),
      paths: { "lib/*": ["location/*"] },
      fileExists: (name: string) => name === path.resolve("./", "location/mylib")
    });
    assert.equal(result, "../location/mylib");
  });

  it('should not locate path that does not match', () => {

      const result = findPath({
      sourceFileName: "./asd.ts",
      request: "mylib",
      absoluteBaseUrl: path.resolve("./"),
      paths: { "lib/*": ["location/*"] },
      fileExists: (name: string) => name === path.resolve("./", "location/mylib")
    });
    assert.equal(result, undefined);
  });

});
