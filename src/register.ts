import { createMatchPath } from "./match-path";
import {configLoader, ExplicitParams} from "./config-loader";

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function register(explicitParams: ExplicitParams) {
  const { absoluteBaseUrl, paths } = configLoader({
    cwd: process.cwd(),
    explicitParams,
  });
  const matchPath = createMatchPath(
    absoluteBaseUrl,
    paths
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
