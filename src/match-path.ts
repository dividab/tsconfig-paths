import * as fs from "fs";
import * as path from "path";
import {matchStar} from "./match-star";

export type MatchPath = (absoluteSourceFileName: string, requestedModule: string,
                         fileExists?: any, extensions?: Array<string>) => string | undefined;

/**
 * Creates a function that can resolve paths according to tsconfig paths property.
 * @param tsConfigPath The paths where tsconfig.json is located.
 * @param baseUrl The baseUrl specified in tsconfig.
 * @param paths The paths specified in tsconfig.
 */
export function createMatchPath(tsConfigPath: string,
                                baseUrl: string,
                                paths: {[key: string]: Array<string>}): MatchPath {

  // Resolve all paths to absolute form once here, this saves time on each request later
  const absoluteBaseUrl = path.dirname(path.join(tsConfigPath, baseUrl));
  const absolutePaths: {[key: string]: Array<string>} = Object.keys(paths)
    .reduce((soFar, key) => ({
      ...soFar,
      [key]: paths[key]
        .map((pathToResolve) => path.join(absoluteBaseUrl, pathToResolve))
    }), {});

  return (sourceFileName: string, requestedModule: string, fileExists: any, extensions?: Array<string>) =>
    matchFromAbsolutePaths(absolutePaths, sourceFileName, requestedModule, fileExists, extensions);

}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param absolutePathMappings The paths to try as specified in tsconfig but resolved to absolute form.
 * @param absoluteSourceFileName Absolute path to the file that requested the module.
 * @param requestedModule The required module name.
 * @param fileExists Function that checks for existance of a file (useful for testing).
 * @param extensions File extensions to probe for (useful for testing).
 * @returns the found path, or undefined if no path was found.
 */
export function matchFromAbsolutePaths(absolutePathMappings: {[key: string]: Array<string>},
                                       absoluteSourceFileName: string,
                                       requestedModule: string,
                                       fileExists = fs.existsSync,
                                       extensions = Object.keys(require.extensions)): string | undefined {

  if (requestedModule[0] !== '.'
    && requestedModule[0] !== path.sep
    && absolutePathMappings
    && absoluteSourceFileName
    && requestedModule
    && fileExists) {
    for (const virtualPathPattern of Object.keys(absolutePathMappings)) {
      const starMatch = virtualPathPattern === requestedModule ? '' : matchStar(virtualPathPattern, requestedModule);
      if (starMatch !== undefined) {
        for (const physicalPathPattern of absolutePathMappings[virtualPathPattern]) {
          const physicalPath = physicalPathPattern.replace('*', starMatch);
          const exists = mappingExists(physicalPath, fileExists, extensions);
          if (exists) {
            return physicalPath;
          }
        }
      }
    }
  }
  return undefined;

}

function mappingExists(physicalPath: string, fileExists: any, extensions: Array<string>) {
  return fileExists(physicalPath) ||
    extensions.reduce((prev, curr) => prev || fileExists(physicalPath + curr), false);
}
