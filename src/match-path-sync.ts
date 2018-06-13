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
 * @param mainFields A list of package.json field names to try when resolving module files.
 */
export function createMatchPath(
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> },
  mainFields: string[] = ["main"]
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
      extensions,
      mainFields
    );
}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param absolutePathMappings The paths to try as specified in tsconfig but resolved to absolute form.
 * @param requestedModule The required module name.
 * @param readJson Function that can read json from a path (useful for testing).
 * @param fileExists Function that checks for existance of a file at a path (useful for testing).
 * @param extensions File extensions to probe for (useful for testing).
 * @param mainFields A list of package.json field names to try when resolving module files.
 * @returns the found path, or undefined if no path was found.
 */
export function matchFromAbsolutePaths(
  absolutePathMappings: ReadonlyArray<MappingEntry.MappingEntry>,
  requestedModule: string,
  readJson: Filesystem.ReadJsonSync = Filesystem.readJsonFromDiskSync,
  fileExists: Filesystem.FileExistsSync = Filesystem.fileExistsSync,
  extensions: Array<string> = Object.keys(require.extensions),
  mainFields: string[] = ["main"]
): string | undefined {
  const tryPaths = TryPath.getPathsToTry(
    extensions,
    absolutePathMappings,
    requestedModule
  );

  if (!tryPaths) {
    return undefined;
  }

  return findFirstExistingPath(tryPaths, readJson, fileExists, mainFields);
}

/**
 * Given a parsed package.json object, get the first field name that is defined
 * in a list of prioritized field names to try.
 *
 * @param packageJson Parsed JSON object from package.json. May be undefined.
 * @param mainFields A list of field names to try (in order)
 * @returns The first matched field name in packageJson, or undefined.
 */
export function getPrioritizedMainFieldName(
  packageJson: Filesystem.PackageJson | undefined,
  mainFields: string[]
): string | undefined {
  if (packageJson) {
    for (let index = 0; index < mainFields.length; index++) {
      const mainFieldName = mainFields[index];
      if (
        packageJson[mainFieldName] &&
        typeof packageJson[mainFieldName] === "string"
      ) {
        return mainFieldName;
      }
    }
  }

  return undefined;
}

function findFirstExistingPath(
  tryPaths: ReadonlyArray<TryPath.TryPath>,
  readJson: Filesystem.ReadJsonSync = Filesystem.readJsonFromDiskSync,
  fileExists: Filesystem.FileExistsSync,
  mainFields: string[] = ["main"]
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
      const mainFieldName = getPrioritizedMainFieldName(
        packageJson,
        mainFields
      );
      if (mainFieldName) {
        const file = path.join(
          path.dirname(tryPath.path),
          packageJson[mainFieldName]
        );
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
