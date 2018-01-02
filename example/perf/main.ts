import { createMatchPath } from "../../src";
import * as Tsconfig from "tsconfig";
import * as path from "path";

// Load tsconfig
const loadResult = Tsconfig.loadSync(process.cwd());

// Create function that will match paths
const matchPath = createMatchPath(
  path.join(
    path.dirname(loadResult.path),
    loadResult.config.compilerOptions.baseUrl
  ),
  loadResult.config.compilerOptions.paths
);

console.time("Matching path 10.000 times");
for (let i = 0; i < 10000; i++) {
  const result = matchPath(
    path.resolve("./test.ts"),
    "foo/mylib",
    undefined,
    undefined,
    [".ts", ".tsx", ".js"]
  );
}
console.timeEnd("Matching path 10.000 times");
