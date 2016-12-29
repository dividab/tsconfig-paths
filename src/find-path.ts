import * as fs from "fs";
import * as path from "path";
import { matchStar } from "./match-star";

export interface FindPathParameters {
  sourceFileName: string,
  request: string,
  baseUrl: string,
  paths: { [key: string]: Array<string> },
  fileExists?: (name: string) => boolean
}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param sourceFileName Absolute path to the file that requested the module.
 * @param request The requested module.
 * @param baseUrl Absolute path to tsconfig directory.
 * @param paths The paths to try.
 * @param fileExists Function that checks for existance of a file.
 * @returns the found path, or undefined if no path was found.
 */

export function findPath({
  sourceFileName,
  request,
  baseUrl,
  paths,
  fileExists = fs.existsSync
}: FindPathParameters) {

  if (!sourceFileName) {
    return undefined;
  }

  const sourceFileDir = path.dirname(sourceFileName);

  if (request[0] !== '.' && request[0] !== path.sep && request && baseUrl && paths) {
    for (const key of Object.keys(paths)) {
      const starReplace = key === request ? '' : matchStar(key, request);
      if (starReplace !== undefined) {
        for (const pathToTry of paths[key]) {
          const possibleModule = path.resolve(baseUrl, pathToTry.replace('*', starReplace));
          if (fileExists(possibleModule)) {
            return convertToLocal(path.relative(sourceFileDir, possibleModule));
          }
          else if (fileExists(possibleModule + '.ts')) {
            return convertToLocal(path.relative(sourceFileDir, possibleModule + '.ts'));
          }
          else if (fileExists(possibleModule + '.tsx')) {
            return convertToLocal(path.relative(sourceFileDir, possibleModule + '.tsx'));
          }
        }
      }
    }
  }
  return undefined;

}

function convertToLocal(pathString: string) {
  if (pathString && pathString[0] !== ".") {
    return `.${path.sep}${pathString}`;
  }

  return pathString;
}
