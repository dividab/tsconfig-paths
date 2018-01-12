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

export interface FileExistsAsync {
  (path: string, callback: (err?: Error, exists?: boolean) => void): void;
}

export interface ReadJsonAsync {
  // tslint:disable-next-line:no-any
  (path: string, callback: (err?: Error, content?: any) => void): void;
}

export function readJsonAsync(
  path: string,
  // tslint:disable-next-line:no-any
  callback: (err?: Error, content?: any) => void
): void {
  console.log("TODO!!!", path);
  callback(undefined, undefined);
}

export function fileExistsAsync(
  path2: string,
  callback2: (err?: Error, exists?: boolean) => void
): void {
  fs.stat(path2, (err: Error, stats: fs.Stats) => {
    if (err) {
      // If error assume file does not exist
      return callback2(undefined, false);
    }
    callback2(undefined, stats ? stats.isFile() : false);
  });
}
