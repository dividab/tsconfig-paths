import * as fs from "fs";

export function readPackage(
  packageJsonPath: string,
  loadPackageJson: (file: string) => any = loadPackageJsonFromDisk,
  fileExists: (path: string) => boolean = fs.existsSync
) {
  return !!packageJsonPath.match(/package\.json$/) && fileExists(packageJsonPath) && loadPackageJson(packageJsonPath);
}

function loadPackageJsonFromDisk(file: string) {
  const packageJson = require(file);

  return packageJson;
}
