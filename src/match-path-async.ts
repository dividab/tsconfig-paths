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
  // Recursive loop to probe for physical files
  function checkFiles(
    index: number,
    myTryPaths: ReadonlyArray<TryPath.TryPath>,
    fileExistsResults: Array<boolean>,
    doneCallback: (err?: Error, result?: Array<boolean>) => void
  ): void {
    const tryPath = myTryPaths[index];
    if (
      tryPath.type === "file" ||
      tryPath.type === "extension" ||
      tryPath.type === "index"
    ) {
      fileExists(tryPath.path, (err: Error, exists: boolean) => {
        if (err) {
          return doneCallback(err);
        }
        fileExistsResults[index] = exists;
        if (index === myTryPaths.length - 1) {
          return doneCallback(undefined, fileExistsResults);
        }
        return checkFiles(
          index + 1,
          myTryPaths,
          fileExistsResults,
          doneCallback
        );
      });
    } else if (tryPath.type === "package") {
      // TODO!
      return checkFiles(index + 1, myTryPaths, fileExistsResults, doneCallback);
    } else {
      TryPath.exhaustiveTypeException(tryPath.type);
    }
  }

  // Determine the physical paths to probe
  const tryPaths = TryPath.getPathsToTry(
    extensions,
    absolutePathMappings,
    requestedModule
  );

  if (!tryPaths) {
    return callback();
  }

  const fileExistsResults2: Array<boolean> = [];

  // Start the probing at index 0
  checkFiles(0, tryPaths, fileExistsResults2, afterFilesChecked2);

  function afterFilesChecked2(err?: Error, _result?: Array<boolean>): void {
    // console.log("afterFilesChecked", err, fileExistsResults);
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (!tryPaths) {
      return callback(new Error("pathsToTry cannot be undefined."));
    }
    for (let i = 0; i < fileExistsResults2.length; i++) {
      if (fileExistsResults2[i]) {
        const tryPath = tryPaths[i];
        // Not sure why we don't just return the full path? Why strip it?
        return callback(undefined, TryPath.getStrippedPath(tryPath));
      }
    }
    return callback();
  }
}
