import { findPath, resolveBaseUrl } from "./find-path";
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

  const absoluteBaseUrl = resolveBaseUrl(tsConfigPath, baseUrl);
  const findPathCurried = (request: string, parent: any) => findPath({
    request,
    absoluteBaseUrl: absoluteBaseUrl,
    paths,
    sourceFileName: parent && parent.filename
  });

  const Module = require('module');
  const originalLoader = Module._load;

  Module._load = function (request: string, parent: any) {

    const found = findPathCurried(request, parent);
    if (found) {
      const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
      return originalLoader.apply(this, modifiedArguments);
    }

    return originalLoader.apply(this, arguments);
  }

}

function readConfig(project: string | boolean | undefined, cwd: string) {
  return tsconfig.loadSync(cwd, typeof project === 'string' ? project : undefined);
}
