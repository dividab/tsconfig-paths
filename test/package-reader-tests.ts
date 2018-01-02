import { readPackage } from "../src/package-reader";
import { assert } from "chai";

describe("package-reader", () => {
  it("should only process files that is named package.json", () => {
    const result = readPackage(
      "/root/my-package/package.js",
      (_: string) => ({ asdf: "asdasd" }),
      (path: string) => path === "/root/my-package/package.json"
    );
    assert.isUndefined(result);
  });

  it("should process files that is named package.json", () => {
    const result = readPackage(
      "/root/my-package/package.json",
      (_: string) => ({ main: "asdasd" }),
      (path: string) => path === "/root/my-package/package.json"
    );
    assert.deepEqual(result, { main: "asdasd" });
  });
});
