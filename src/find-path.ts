import * as fs from "fs";
import * as path from "path";
import {matchStar} from "./match-star";

/**
 * Finds a path from tsconfig that matches a module load request.
 * @returns the found path, or undefined if no path was found.
 */
export function findPath(request: string, baseUrl: string, paths: {[key: string]: Array<string>}) {

  if (request[0] !== '.' && request[0] !== '/') {
    for (const key of Object.keys(paths)) {
      const starReplace = key === request ? '' : matchStar(key, request);
      if (starReplace !== undefined) {
        for (const pathToTry of paths[key]) {
          const file = pathToTry.replace('*', starReplace);
          if (fs.existsSync(path.join(baseUrl, file))
            || fs.existsSync(path.join(baseUrl, file + '.ts'))
            || fs.existsSync(path.join(baseUrl, file + '.tsx'))) {
            return file
          }
        }
      }
    }
  }
  return undefined

}

