import { createMatchPath } from "./match-path";
import { configLoader, ExplicitParams } from "./config-loader";

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function register(explicitParams: ExplicitParams) {
  const configLoaderResult = configLoader({
    cwd: process.cwd(),
    explicitParams,
  });

  if (configLoaderResult.resultType === "failed") {
    console.warn(`${configLoaderResult.message}. tsconfig-paths will be skipped`);
    return;
  }

  const matchPath = createMatchPath(
    configLoaderResult.absoluteBaseUrl,
    configLoaderResult.paths
  );

  // Patch node's module loading
  const Module = require('module');
  const originalResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function (request: string, parent: any) {
    const found = matchPath(parent, request);
    if (found) {
      const modifiedArguments = [found, ...[].slice.call(arguments, 1)]; // Passes all arguments. Even those that is not specified above.
      return originalResolveFilename.apply(this, modifiedArguments);
    }
    return originalResolveFilename.apply(this, arguments);
  }

}
