import * as path from "path";
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
 * See the sync version for docs.
 */
export function createMatchPathAsync(
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> },
  mainFields: string[] = ["main"]
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
      callback,
      mainFields
    );
}

/**
 * See the sync version for docs.
 */
export function matchFromAbsolutePathsAsync(
  absolutePathMappings: ReadonlyArray<MappingEntry.MappingEntry>,
  requestedModule: string,
  readJson: Filesystem.ReadJsonAsync = Filesystem.readJsonFromDiskAsync,
  fileExists: Filesystem.FileExistsAsync = Filesystem.fileExistsAsync,
  extensions: ReadonlyArray<string> = Object.keys(require.extensions),
  callback: MatchPathAsyncCallback,
  mainFields: string[] = ["main"]
): void {
  const tryPaths = TryPath.getPathsToTry(
    extensions,
    absolutePathMappings,
    requestedModule
  );

  if (!tryPaths) {
    return callback();
  }

  findFirstExistingPath(
    tryPaths,
    readJson,
    fileExists,
    callback,
    0,
    mainFields
  );
}

/**
 * Given a (possibly undefiend) package.json object, return the first
 * defined field name from a prioritized list. Returns undefined if no field name
 * in the list is defined in the object.
 */
function getPrioritizedMainFieldName(
  packageJson: { [key: string]: Object } | undefined,
  mainFields: string[]
): string | undefined {
  if (packageJson) {
    for (let index = 0; index < mainFields.length; index++) {
      const mainFieldsName = mainFields[index];
      if (packageJson[mainFieldsName]) {
        return mainFieldsName;
      }
    }
  }

  return undefined;
}

// Recursive loop to probe for physical files
function findFirstExistingPath(
  tryPaths: ReadonlyArray<TryPath.TryPath>,
  readJson: Filesystem.ReadJsonAsync,
  fileExists: Filesystem.FileExistsAsync,
  doneCallback: MatchPathAsyncCallback,
  index: number = 0,
  mainFields: string[] = ["main"]
): void {
  const tryPath = tryPaths[index];
  if (
    tryPath.type === "file" ||
    tryPath.type === "extension" ||
    tryPath.type === "index"
  ) {
    fileExists(tryPath.path, (err: Error, exists: boolean) => {
      if (err) {
        return doneCallback(err);
      }
      if (exists) {
        // Not sure why we don't just return the full path? Why strip it?
        return doneCallback(undefined, TryPath.getStrippedPath(tryPath));
      }
      if (index === tryPaths.length - 1) {
        return doneCallback();
      }
      // Continue with the next path
      return findFirstExistingPath(
        tryPaths,
        readJson,
        fileExists,
        doneCallback,
        index + 1,
        mainFields
      );
    });
  } else if (tryPath.type === "package") {
    readJson(tryPath.path, (err, packageJson) => {
      if (err) {
        return doneCallback(err);
      }
      const mainFieldName = getPrioritizedMainFieldName(
        packageJson,
        mainFields
      );
      if (mainFieldName) {
        const file = path.join(
          path.dirname(tryPath.path),
          packageJson[mainFieldName]
        );
        fileExists(file, (err2, exists) => {
          if (err2) {
            return doneCallback(err2);
          }
          if (exists) {
            // Not sure why we don't just return the full path? Why strip it?
            return doneCallback(undefined, Filesystem.removeExtension(file));
          }
          // Continue with the next path
          return findFirstExistingPath(
            tryPaths,
            readJson,
            fileExists,
            doneCallback,
            index + 1,
            mainFields
          );
        });
      } else {
        // This is async code, we need to return in an else-branch otherwise the code still falls through and keeps recursing.
        // While this might work in general, libraries that use neo-async like Webpack will actually not allow you to call the same callback twice.
        // An example of where this caused issues: https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/11

        // Continue with the next path
        return findFirstExistingPath(
          tryPaths,
          readJson,
          fileExists,
          doneCallback,
          index + 1,
          mainFields
        );
      }
    });
  } else {
    TryPath.exhaustiveTypeException(tryPath.type);
  }
}
