import { readPackageJsonFromDisk, ReadPackageJson } from "./read-package-json";
import * as fs from "fs";
import * as path from "path";
import { matchStar } from "./match-star";

export type MatchPath = (
  absoluteSourceFileName: string,
  requestedModule: string,
  readPackageJson?: ReadPackageJson,
  fileExists?: (name: string) => boolean,
  extensions?: ReadonlyArray<string>
) => string | undefined;

/**
 * Creates a function that can resolve paths according to tsconfig paths property.
 * @param tsConfigPath The paths where tsconfig.json is located.
 * @param baseUrl The baseUrl specified in tsconfig.
 * @param paths The paths specified in tsconfig.
 */
export function createMatchPath(
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> }
): MatchPath {
  // Resolve all paths to absolute form once here, this saves time on each request later.
  // We also add the baseUrl as a base which will be replace if specified in paths. This is how typescript works
  const absolutePaths: { [key: string]: Array<string> } = Object.keys(
    paths
  ).reduce(
    (soFar, key) => ({
      ...soFar,
      [key]: paths[key].map(pathToResolve =>
        path.join(absoluteBaseUrl, pathToResolve)
      )
    }),
    {
      "*": [`${absoluteBaseUrl.replace(/\/$/, "")}/*`]
    }
  );

  return (
    sourceFileName: string,
    requestedModule: string,
    readPackageJson?: ReadPackageJson,
    fileExists?: (path: string) => boolean,
    extensions?: Array<string>
  ) =>
    matchFromAbsolutePaths(
      absolutePaths,
      sourceFileName,
      requestedModule,
      readPackageJson,
      fileExists,
      extensions
    );
}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param absolutePathMappings The paths to try as specified in tsconfig but resolved to absolute form.
 * @param absoluteSourceFileName Absolute path to the file that requested the module.
 * @param requestedModule The required module name.
 * @param readPackageJson Function that returns parsed package.json if exists or undefined(useful for testing).
 * @param fileExists Function that checks for existance of a file (useful for testing).
 * @param extensions File extensions to probe for (useful for testing).
 * @returns the found path, or undefined if no path was found.
 */
export function matchFromAbsolutePaths(
  absolutePathMappings: { [key: string]: Array<string> },
  absoluteSourceFileName: string,
  requestedModule: string,
  readPackageJson: ReadPackageJson = readPackageJsonFromDisk,
  fileExists: (name: string) => boolean = fs.existsSync,
  extensions: Array<string> = Object.keys(require.extensions)
): string | undefined {
  if (
    requestedModule[0] !== "." &&
    requestedModule[0] !== path.sep &&
    absolutePathMappings &&
    absoluteSourceFileName &&
    requestedModule &&
    fileExists
  ) {
    for (const virtualPathPattern of sortByLongestPrefix(
      Object.keys(absolutePathMappings)
    )) {
      const starMatch =
        virtualPathPattern === requestedModule
          ? ""
          : matchStar(virtualPathPattern, requestedModule);
      if (starMatch !== undefined) {
        for (const physicalPathPattern of absolutePathMappings[
          virtualPathPattern
        ]) {
          const physicalPath = physicalPathPattern.replace("*", starMatch);
          const resolved = tryResolve(
            physicalPath,
            fileExists,
            readPackageJson,
            extensions
          );
          if (resolved) {
            return resolved;
          }
        }
      }
    }
  }
  return undefined;
}

/**
 * Tries to resolve a physical path by:
 * 1. Check for files named as last part of request and ending in any of the extensions.
 * 2. Check for file specified in package.json's main property.
 * 3. Check for a file named index ending in any of the extensions.
 * @param physicalPath The path to check.
 * @param fileExists Function that checks for existance of a file (useful for testing).
 * @param readPackageJson Function that returns parsed package.json if exists or undefined(useful for testing).
 * @param extensions File extensions to probe for (useful for testing).
 * @returns {string}
 */
function tryResolve(
  physicalPath: string,
  fileExists: (name: string) => boolean,
  readPackageJson: ReadPackageJson,
  extensions: ReadonlyArray<string>
): string | undefined {
  if (
    path.extname(path.basename(physicalPath)).length > 0 &&
    fileExists(physicalPath)
  ) {
    return physicalPath;
  }

  for (const extension of extensions) {
    if (fileExists(physicalPath + extension)) {
      return physicalPath;
    }
  }

  const packageJson = readPackageJson(path.join(physicalPath, "/package.json"));

  if (
    packageJson &&
    packageJson.main &&
    fileExists(path.join(physicalPath, packageJson.main))
  ) {
    const file = path.join(physicalPath, packageJson.main);
    const fileExtension = path.extname(file).replace(/^\./, "");
    const fileExtensionRegex = new RegExp(`\.${fileExtension}$`);
    return fileExtension ? file.replace(fileExtensionRegex, "") : file;
  }

  const indexPath = path.join(physicalPath, "/index");
  for (const extension of extensions) {
    if (fileExists(indexPath + extension)) {
      return physicalPath;
    }
  }
  return undefined;
}

/**
 * Sort path patterns.
 * If module name can be matches with multiple patterns then pattern with the longest prefix will be picked.
 */
function sortByLongestPrefix(arr: Array<string>): Array<string> {
  return arr
    .concat()
    .sort((a: string, b: string) => getPrefixLength(b) - getPrefixLength(a));
}

function getPrefixLength(pattern: string): number {
  const prefixLength = pattern.indexOf("*");
  return pattern.substr(0, prefixLength).length;
}
