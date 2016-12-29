import {findPath} from "../../src";
import * as Tsconfig from "tsconfig";
import * as path from "path";

Tsconfig.loadSync();

const result = findPath({
  sourceFileName: "./test.ts",
  request: "lib/mylib",
  absoluteBaseUrl: path.resolve("./"),
  paths: { "lib/*": ["location/*"] },
  fileExists: (name: string) => name === path.resolve("./", "location/mylib")
});

console.log(result);
