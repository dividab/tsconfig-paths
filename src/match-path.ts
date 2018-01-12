import { readJsonFromDisk, ReadJson } from "./filesystem";
import * as fs from "fs";
import * as path from "path";
import { matchStar } from "./match-star";

/**
 * Function that can match a path
 */
export interface MatchPath {
  (
    absoluteSourceFileName: string,
    requestedModule: string,
    readPackageJson?: ReadJson,
    fileExists?: (name: string) => boolean,
    extensions?: ReadonlyArray<string>
  ): string | undefined;
}

/**
 * Typing for the fields of package.json we care about
 */
export interface PackageJson {
  readonly main?: string;
}

export interface MappingEntry {
  readonly pattern: string;
  readonly paths: ReadonlyArray<string>;
}

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
  // Resolve all paths to absolute form once here, and sort them by
  // longest prefix once here, this saves time on each request later.
  // We need to put them in an array to preseve the sorting order.
  const sortedKeys = sortByLongestPrefix(Object.keys(paths));
  const absolutePaths: Array<MappingEntry> = [];
  for (const key of sortedKeys) {
    absolutePaths.push({
      pattern: key,
      paths: paths[key].map(pathToResolve =>
        path.join(absoluteBaseUrl, pathToResolve)
      )
    });
  }
  // If there is no match-all path specified in the paths section of tsconfig, then try to match all
  // all relative to baseUrl, this is how typescript works.
  if (!paths["*"]) {
    absolutePaths.push({
      pattern: "*",
      paths: [`${absoluteBaseUrl.replace(/\/$/, "")}/*`]
    });
  }

  return (
    sourceFileName: string,
    requestedModule: string,
    readJson?: ReadJson,
    fileExists?: (path: string) => boolean,
    extensions?: Array<string>
  ) =>
    matchFromAbsolutePaths(
      absolutePaths,
      sourceFileName,
      requestedModule,
      readJson,
      fileExists,
      extensions
    );
}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param absolutePathMappings The paths to try as specified in tsconfig but resolved to absolute form.
 * @param absoluteSourceFileName Absolute path to the file that requested the module.
 * @param requestedModule The required module name.
 * @param readJson Function that can read json from a path (useful for testing).
 * @param fileExists Function that checks for existance of a file at a path (useful for testing).
 * @param extensions File extensions to probe for (useful for testing).
 * @returns the found path, or undefined if no path was found.
 */
export function matchFromAbsolutePaths(
  absolutePathMappings: ReadonlyArray<MappingEntry>,
  absoluteSourceFileName: string,
  requestedModule: string,
  readJson: ReadJson = readJsonFromDisk,
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
    for (const entry of absolutePathMappings) {
      const starMatch =
        entry.pattern === requestedModule
          ? ""
          : matchStar(entry.pattern, requestedModule);
      if (starMatch !== undefined) {
        for (const physicalPathPattern of entry.paths) {
          const physicalPath = physicalPathPattern.replace("*", starMatch);
          const resolved = tryPhysicalResolve(
            physicalPath,
            extensions,
            fileExists,
            readJson
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
 * @param extensions File extensions to probe for (useful for testing).
 * @param fileExists Function that checks for existance of a file (useful for testing).
 * @param readJson Function that returns parsed package.json if exists or undefined(useful for testing).
 * @returns {string}
 */
function tryPhysicalResolve(
  physicalPath: string,
  extensions: ReadonlyArray<string>,
  fileExists: (name: string) => boolean,
  readJson: ReadJson
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

  const packageJson: PackageJson = readJson(
    path.join(physicalPath, "/package.json")
  );

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
 * If a module name can be matched with multiple patterns then pattern with the longest prefix will be picked.
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
