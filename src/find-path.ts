import * as fs from "fs";
import * as path from "path";
import {matchStar} from "./match-star";

/**
 * Finds a path from tsconfig that matches a module load request.
 * @param filename The file that requested the module.
 * @param request The requested module.
 * @param baseUrl The origin to resolve from.
 * @param paths The paths to try.
 * @param fileExists Function that checks for existance of a file.
 * @returns the found path, or undefined if no path was found.
 */
export function findPath(filename: string | undefined, request: string, baseUrl: string, paths: {[key: string]: Array<string>},
                         fileExists: (name: string) => boolean = fs.existsSync) {

  console.log("filename", filename);

  if (request[0] !== '.' && request[0] !== '/' && request && baseUrl && paths) {
    for (const key of Object.keys(paths)) {
      const starReplace = key === request ? '' : matchStar(key, request);
      if (starReplace !== undefined) {
        for (const pathToTry of paths[key]) {
          // console.log(`key: ${key}, starReplace: ${starReplace}, pathToTry: ${starReplace}`);
          const file = pathToTry.replace('*', starReplace);
          if (fileExists(path.join(baseUrl, file))
            || fileExists(path.join(baseUrl, file + '.ts'))
            || fileExists(path.join(baseUrl, file + '.tsx'))) {
            return file
          }
        }
      }
    }
  }
  return undefined;

}

