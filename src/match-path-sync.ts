import * as path from "path";
import * as Filesystem from "./filesystem";
import * as MappingEntry from "./mapping-entry";
import { matchStar } from "./match-star";

/**
 * Function that can match a path
 */
export interface MatchPath {
  (
    requestedModule: string,
    readJson?: Filesystem.ReadJsonSync,
    fileExists?: (name: string) => boolean,
    extensions?: ReadonlyArray<string>
  ): string | undefined;
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
  const absolutePaths = MappingEntry.getAbsoluteMappingEntries(
    absoluteBaseUrl,
    paths
  );

  return (
    requestedModule: string,
    readJson?: Filesystem.ReadJsonSync,
    fileExists?: Filesystem.FileExistsSync,
    extensions?: Array<string>
  ) =>
    matchFromAbsolutePaths(
      absolutePaths,
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
  absolutePathMappings: ReadonlyArray<MappingEntry.MappingEntry>,
  requestedModule: string,
  readJson: Filesystem.ReadJsonSync = Filesystem.readJsonFromDiskSync,
  fileExists: Filesystem.FileExistsSync = Filesystem.fileExistsSync,
  extensions: Array<string> = Object.keys(require.extensions)
): string | undefined {
  if (
    requestedModule[0] !== "." &&
    requestedModule[0] !== path.sep &&
    absolutePathMappings &&
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
  readJson: Filesystem.ReadJsonSync
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

  const packageJson: Filesystem.PackageJson = readJson(
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
