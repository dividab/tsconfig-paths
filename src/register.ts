import { createMatchPath } from "./match-path";
import { loadTsConfig } from "./tsconfig-loader";

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function register() {

  // Load tsconfig and create path matching function
  const loadResult = loadTsConfig({
    cwd: process.cwd(),
    getEnv: (key:string) => process.env[key],
  });
  if (!loadResult.tsConfigPath) {
    throw new Error("Couldn't find tsconfig");
  }
  const matchPath = createMatchPath(
    loadResult.tsConfigPath,
    loadResult.baseUrl,
    loadResult.paths
  );

  // Patch node's module loading
  const Module = require('module');
  const originalLoader = Module._load;
  Module._load = function (request: string, parent: any) {
    const found = matchPath(parent, request);
    if (found) {
      const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
      return originalLoader.apply(this, modifiedArguments);
    }
    return originalLoader.apply(this, arguments);
  }

}
