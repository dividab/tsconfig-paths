import * as console from 'console';
import * as fs from "fs";
import * as path from "path";
import { matchStar } from "./match-star";

export interface FindPathParameters {
  sourceFileName: string,
  request: string,
  tsConfig: string,
  baseUrl: string,
  paths: { [key: string]: Array<string> },
  fileExists?: (name: string) => boolean
}

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param sourceFileName The file that requested the module.
 * @param request The requested module.
 * @param tsConfig Path to tsconfig.
 * @param baseUrl relative from tsConfigDir.
 * @param paths The paths to try.
 * @param fileExists Function that checks for existance of a file.
 * @returns the found path, or undefined if no path was found.
 */

export function findPath({
  sourceFileName,
  request,
  tsConfig,
  baseUrl,
  paths,
  fileExists = fs.existsSync
}: FindPathParameters) {

  if (!sourceFileName) {
    return undefined;
  }

  const projectBaseUrl = path.dirname(path.join(tsConfig, baseUrl));
  const sourceFileDir = path.resolve(path.dirname(tsConfig), path.dirname(sourceFileName));

  if (request[0] !== '.' && request[0] !== path.sep && request && projectBaseUrl && paths) {
    for (const key of Object.keys(paths)) {
      const starReplace = key === request ? '' : matchStar(key, request);
      if (starReplace !== undefined) {
        for (const pathToTry of paths[key]) {
          const possibleModule = path.resolve(projectBaseUrl, pathToTry.replace('*', starReplace));
          console.log("possibleModule: " + possibleModule);
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
