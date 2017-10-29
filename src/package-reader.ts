import * as fs from "fs";
/**
 * @param  packageJsonPath Path to package.json
 * @param  loadPackageJson Function that reads and parses package.json.
 * @param  fileExists Function that checks for existance of a file.
 * @returns string
 */
export function readPackage(
  packageJsonPath: string,
  loadPackageJson: (file: string) => any = loadJsonFromDisk,
  fileExists: (path: string) => boolean = fs.existsSync
): { main: string } | undefined {
  return (
    (packageJsonPath.match(/package\.json$/) &&
      fileExists(packageJsonPath) &&
      loadPackageJson(packageJsonPath)) ||
    undefined
  );
}

function loadJsonFromDisk(file: string) {
  const packageJson = require(file);

  return packageJson;
}
