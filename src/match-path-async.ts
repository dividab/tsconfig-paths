import * as TryPath from "./try-path";
import * as MappingEntry from "./mapping-entry";
import * as Filesystem from "./filesystem";

/**
 * Function that can match a path async
 */
export interface MatchPathAsync {
  (
    requestedModule: string,
    readJson: Filesystem.ReadJsonAsync | undefined,
    fileExists: Filesystem.FileExistsAsync | undefined,
    extensions: ReadonlyArray<string> | undefined,
    callback: MatchPathAsyncCallback
  ): void;
}

export interface MatchPathAsyncCallback {
  (err?: Error, path?: string): void;
}

/**
 * Creates a function that can resolve paths according to tsconfig paths property.
 * @param tsConfigPath The paths where tsconfig.json is located.
 * @param baseUrl The baseUrl specified in tsconfig.
 * @param paths The paths specified in tsconfig.
 */
export function createMatchPathAsync(
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> }
): MatchPathAsync {
  const absolutePaths = MappingEntry.getAbsoluteMappingEntries(
    absoluteBaseUrl,
    paths
  );

  return (
    requestedModule: string,
    readJson: Filesystem.ReadJsonAsync | undefined,
    fileExists: Filesystem.FileExistsAsync | undefined,
    extensions: ReadonlyArray<string> | undefined,
    callback: MatchPathAsyncCallback
  ) =>
    matchFromAbsolutePathsAsync(
      absolutePaths,
      requestedModule,
      readJson,
      fileExists,
      extensions,
      callback
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
export function matchFromAbsolutePathsAsync(
  absolutePathMappings: ReadonlyArray<MappingEntry.MappingEntry>,
  requestedModule: string,
  _readJson: Filesystem.ReadJsonAsync = Filesystem.readJsonFromDiskAsync,
  fileExists: Filesystem.FileExistsAsync = Filesystem.fileExistsAsync,
  extensions: ReadonlyArray<string> = Object.keys(require.extensions),
  callback: MatchPathAsyncCallback
): void {
  // Determine the physical paths to probe
  const pathsToTry = TryPath.getPathsToTry(
    extensions,
    absolutePathMappings,
    requestedModule
  );

  if (!pathsToTry) {
    return callback();
  }

  // Recursive loop to probe for physical files
  const fileExistsResults: Array<boolean> = [];
  function checkFile(index: number): void {
    if (!pathsToTry) {
      return afterFilesChecked(new Error("pathsToTry cannot be undefined."));
    }
    const toTry = pathsToTry[index];
    if (toTry.type === "file") {
      fileExists(toTry.path, (err: Error, exists: boolean) => {
        if (err) {
          return afterFilesChecked(err);
        }
        fileExistsResults[index] = exists;
        if (index === pathsToTry.length - 1) {
          return afterFilesChecked();
        }
        return checkFile(index + 1);
      });
    } else {
      return checkFile(index + 1);
    }
  }

  // Start the probing at index 0
  checkFile(0);

  function afterFilesChecked(err?: Error): void {
    // console.log("afterFilesChecked", err, fileExistsResults);
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (!pathsToTry) {
      return afterFilesChecked(new Error("pathsToTry cannot be undefined."));
    }
    for (let i = 0; i < fileExistsResults.length; i++) {
      if (fileExistsResults[i]) {
        return callback(undefined, pathsToTry[i].path);
      }
    }
    return callback();
  }
}
