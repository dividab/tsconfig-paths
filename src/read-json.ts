import * as fs from "fs";

/**
 * A function that json from a file
 */
export interface ReadJson {
  // tslint:disable-next-line:no-any
  (packageJsonPath: string): any | undefined;
}

/**
 * Reads package.json from disk
 * @param file Path to package.json
 */
// tslint:disable-next-line:no-any
export function readJsonFromDisk(packageJsonPath: string): any | undefined {
  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }
  return require(packageJsonPath);
}
