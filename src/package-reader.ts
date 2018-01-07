import * as fs from "fs";

/**
 * Typing for the fields of package.json we care about
 */
export interface PackageJson {
  readonly main: string;
}

/**
 * A function that reads package.json from a file
 */
export interface ReadPackageJson {
  (packageJsonPath: string): PackageJson | undefined;
}

/**
 * Reads package.json from disk
 * @param file Path to package.json
 */
export function readPackageJsonFromDisk(
  packageJsonPath: string
): PackageJson | undefined {
  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }
  return require(packageJsonPath);
}
