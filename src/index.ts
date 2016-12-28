import {findPath} from "./find-path";
import * as tsconfig from "tsconfig";

main();

function main() {

  const cwd = process.cwd();
  const config = readConfig(undefined, cwd);
  installLoadPatch(config.compilerOptions.baseUrl, config.compilerOptions.paths);

}

function readConfig(project: string | boolean | undefined, cwd: string) {
  const result = tsconfig.loadSync(cwd, typeof project === 'string' ? project : undefined);
  return result.config;
}

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function installLoadPatch(baseUrl: string, paths: {[key: string]: Array<string>}): void {

  // console.log(`installModuleLoadForPaths, paths: ${JSON.stringify(paths)}, baseUrl: ${baseUrl}`);

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
