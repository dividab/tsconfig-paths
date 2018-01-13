import * as path from "path";
import * as Filesystem from "./filesystem";
import * as MappingEntry from "./mapping-entry";
import * as TryPath from "./try-path";

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
  const tryPaths = TryPath.getPathsToTry(
    extensions,
    absolutePathMappings,
    requestedModule
  );

  if (!tryPaths) {
    return undefined;
  }

  return findFirstExistingPath(tryPaths, readJson, fileExists);
}

function findFirstExistingPath(
  tryPaths: ReadonlyArray<TryPath.TryPath>,
  readJson: Filesystem.ReadJsonSync = Filesystem.readJsonFromDiskSync,
  fileExists: Filesystem.FileExistsSync
): string | undefined {
  for (const tryPath of tryPaths) {
    if (
      tryPath.type === "file" ||
      tryPath.type === "extension" ||
      tryPath.type === "index"
    ) {
      if (fileExists(tryPath.path)) {
        // Not sure why we don't just return the full path? Why strip it?
        return TryPath.getStrippedPath(tryPath);
      }
    } else if (tryPath.type === "package") {
      const packageJson: Filesystem.PackageJson = readJson(tryPath.path);
      if (packageJson && packageJson.main) {
        const file = path.join(path.dirname(tryPath.path), packageJson.main);
        if (fileExists(file)) {
          // Not sure why we don't just return the full path? Why strip it?
          return Filesystem.removeExtension(file);
        }
      }
    } else {
      TryPath.exhaustiveTypeException(tryPath.type);
    }
  }
  return undefined;
}
