/**
 * Typing for the fields of package.json we care about
 */
export interface PackageJson {
  readonly main: string;
}

export interface ReadPackageJson {
  (file: string): PackageJson | undefined;
}

/**
 * @param  packageJsonPath Path to package.json
 * @param  readPackageJson Function that reads and parses package.json.
 * @param  fileExists Function that checks for existance of a file.
 * @returns string
 */
export function readPackage(
  packageJsonPath: string,
  readPackageJson: ReadPackageJson = loadJsonFromDisk,
  fileExists: (path: string) => boolean
): PackageJson | undefined {
  return (
    (packageJsonPath.match(/package\.json$/) &&
      fileExists(packageJsonPath) &&
      readPackageJson(packageJsonPath)) ||
    undefined
  );
}

function loadJsonFromDisk(file: string): PackageJson {
  // tslint:disable-next-line:no-require-imports
  const packageJson = require(file);

  return packageJson;
}
