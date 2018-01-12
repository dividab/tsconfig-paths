import * as path from "path";
import { matchStar } from "./match-star";
import { MappingEntry } from "./mapping-entry";

export interface TryPath {
  readonly type: "file" | "package";
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
            e => ({ type: "file", path: physicalPath + e } as TryPath)
          )
        );
        pathsToTry.push({
          type: "package",
          path: path.join(physicalPath, "/package.json")
        });
        const indexPath = path.join(physicalPath, "/index");
        pathsToTry.push(
          ...extensions.map(
            e => ({ type: "file", path: indexPath + e } as TryPath)
          )
        );
      }
    }
  }
  return pathsToTry.length === 0 ? undefined : pathsToTry;
}
