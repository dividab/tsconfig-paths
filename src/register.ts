import { findPath } from "./find-path";
import * as tsconfig from "tsconfig";

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function register() {

  const cwd = process.cwd();
  const {path: tsConfigPath, config} = readConfig(undefined, cwd);

  if (!tsConfigPath) {
    throw new Error("Couldn't find tsconfig");
  }

  const {baseUrl, paths} = config.compilerOptions;

  const Module = require('module');
  const originalLoader = Module._load;

  Module._load = function (request: string, parent: any) {

    const found = findPath(parent && parent.filename, request, tsConfigPath, baseUrl, paths);
    if (found) {
      arguments[0] = found
    }
    return originalLoader.apply(this, arguments)
  }

}

function readConfig(project: string | boolean | undefined, cwd: string) {
  const result = tsconfig.loadSync(cwd, typeof project === 'string' ? project : undefined);
  return result;
}
