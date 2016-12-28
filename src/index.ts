import {findPath} from "./find-path";

installModuleLoadForPaths("", {});

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function installModuleLoadForPaths(baseUrl: string, paths: {[key: string]: Array<string>}): void {

  const Module = require('module');
  const originalLoader = Module._load;
  Module._load = function (request: string) {
    const found = findPath(request, baseUrl, paths);
    if (found) {
      arguments[0] = found
    }
    return originalLoader.apply(this, arguments)
  }

}
