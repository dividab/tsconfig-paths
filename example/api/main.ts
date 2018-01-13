import { createMatchPath } from "../../src";
import * as Tsconfig from "tsconfig";
import * as path from "path";

// Load tsconfig
const loadResult = Tsconfig.loadSync(process.cwd(), undefined);

// Create function that will match paths
const matchPath = createMatchPath(
  path.join(
    path.dirname(loadResult.path),
    loadResult.config.compilerOptions.baseUrl
  ),
  loadResult.config.compilerOptions.paths
);

// Match a path and log result
const result = matchPath("foo/mylib");
console.log(result);
