import * as path from "path";
import { matchStar } from "./match-star";
import { MappingEntry } from "./mapping-entry";
import { dirname } from "path";
import { removeExtension } from "./filesystem";

export interface TryPath {
  readonly type: "file" | "extension" | "index" | "package";
  readonly path: string;
}

/**
 * Builds a list of all physical paths to try by:
 * 1. Check for files named as last part of request and ending in any of the extensions.
 * 2. Check for file specified in package.json's main property.
 * 3. Check for a file named index ending in any of the extensions.
 */
export function getPathsToTry(
  extensions: ReadonlyArray<string>,
  absolutePathMappings: ReadonlyArray<MappingEntry>,
  requestedModule: string
): ReadonlyArray<TryPath> | undefined {
  if (
    requestedModule[0] === "." ||
    requestedModule[0] === path.sep ||
    !absolutePathMappings ||
    !requestedModule
  ) {
    return undefined;
  }

  const pathsToTry: Array<TryPath> = [];
  for (const entry of absolutePathMappings) {
    const starMatch =
      entry.pattern === requestedModule
        ? ""
        : matchStar(entry.pattern, requestedModule);
    if (starMatch !== undefined) {
      for (const physicalPathPattern of entry.paths) {
        const physicalPath = physicalPathPattern.replace("*", starMatch);
        pathsToTry.push({ type: "file", path: physicalPath });
        pathsToTry.push(
          ...extensions.map(
            e => ({ type: "extension", path: physicalPath + e } as TryPath)
          )
        );
        pathsToTry.push({
          type: "package",
          path: path.join(physicalPath, "/package.json")
        });
        const indexPath = path.join(physicalPath, "/index");
        pathsToTry.push(
          ...extensions.map(
            e => ({ type: "index", path: indexPath + e } as TryPath)
          )
        );
      }
    }
  }
  return pathsToTry.length === 0 ? undefined : pathsToTry;
}

// Not sure why we don't just return the full found path?
export function getStrippedPath(tryPath: TryPath): string {
  return tryPath.type === "index"
    ? dirname(tryPath.path)
    : tryPath.type === "file"
      ? tryPath.path
      : tryPath.type === "extension"
        ? removeExtension(tryPath.path)
        : tryPath.type === "package"
          ? tryPath.path
          : exhaustiveTypeException(tryPath.type);
}

export function exhaustiveTypeException(check: never): never {
  throw new Error(`Unknown type ${check}`);
}
