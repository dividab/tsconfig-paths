import {findPath, resolveBaseUrl} from "../../src";
import * as Tsconfig from "tsconfig";

const loadResult = Tsconfig.loadSync(process.cwd(), undefined);
const absoluteBaseUrl = resolveBaseUrl(loadResult.path, loadResult.config.compilerOptions.baseUrl);

console.log(absoluteBaseUrl, loadResult.config.compilerOptions.paths);

const result = findPath({
  sourceFileName: "./test.ts",
  request: "foo/mylib",
  absoluteBaseUrl,
  paths: loadResult.config.compilerOptions.paths
});

console.log(result);
