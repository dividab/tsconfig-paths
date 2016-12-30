import * as fs from "fs";
import * as path from "path";
import { matchStar } from "./match-star";

export type MatchPath = (absoluteSourceFileName: string, requestedModule: string, fileExists?: any) => string | undefined;

/**
 * Creates a function that can resolve paths according to tsconfig paths property.
 * @param tsConfigPath The paths where tsconfig.json is located.
 * @param baseUrl The baseUrl specified in tsconfig.
 * @param paths The paths specified in tsconfig.
 */
export function createMatchPath(tsConfigPath: string,
  baseUrl: string,
  paths: { [key: string]: Array<string> }): MatchPath {

  // Resolve all paths to absolute form once here, this saves time on each request later
  const absoluteBaseUrl = path.dirname(path.join(tsConfigPath, baseUrl));
  const absolutePaths: { [key: string]: Array<string> } = Object.keys(paths)
    .reduce((soFar, key) => ({
      ...soFar,
      [key]: paths[key]
        .map((pathToResolve) => path.join(absoluteBaseUrl, pathToResolve))
    }), {});

  return (sourceFileName: string, requestedModule: string, fileExists: any) =>
    matchFromAbsolutePaths(absolutePaths, sourceFileName, requestedModule, fileExists);

}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param absolutePaths The paths to try as specified in tsconfig but resolved to absolute form.
 * @param absoluteSourceFileName Absolute path to the file that requested the module.
 * @param requestedModule The required module name.
 * @param fileExists Function that checks for existance of a file (useful for testing).
 * @returns the found path, or undefined if no path was found.
 */
export function matchFromAbsolutePaths(absolutePaths: { [key: string]: Array<string> },
  absoluteSourceFileName: string,
  requestedModule: string,
  fileExists = fs.existsSync): string | undefined {

  if (requestedModule[0] !== '.'
    && requestedModule[0] !== path.sep
    && absolutePaths
    && absoluteSourceFileName
    && requestedModule
    && fileExists) {
    for (const key of Object.keys(absolutePaths)) {
      const starMatch = key === requestedModule ? '' : matchStar(key, requestedModule);
      if (starMatch !== undefined) {
        for (const absolutePathToTry of absolutePaths[key]) {
          const possibleModule = absolutePathToTry.replace('*', starMatch);
          if (fileExists(possibleModule)
            || fileExists(possibleModule + '.ts')
            || fileExists(possibleModule + '.tsx')) {
            return possibleModule;
          }
        }
      }
    }
  }
  return undefined;

}
