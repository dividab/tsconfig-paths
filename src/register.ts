import { createMatchPath } from "./match-path-sync";
import { configLoader, ExplicitParams } from "./config-loader";
import { options } from "./options";

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function register(explicitParams: ExplicitParams): void {
  const configLoaderResult = configLoader({
    cwd: options.cwd,
    explicitParams
  });

  if (configLoaderResult.resultType === "failed") {
    console.warn(
      `${configLoaderResult.message}. tsconfig-paths will be skipped`
    );
    return;
  }

  const matchPath = createMatchPath(
    configLoaderResult.absoluteBaseUrl,
    configLoaderResult.paths
  );

  // Patch node's module loading
  // tslint:disable-next-line:no-require-imports variable-name
  const Module = require("module");
  const originalResolveFilename = Module._resolveFilename;
  // tslint:disable-next-line:no-any
  Module._resolveFilename = function(request: string, _parent: any): string {
    const found = matchPath(request);
    if (found) {
      const modifiedArguments = [found, ...[].slice.call(arguments, 1)]; // Passes all arguments. Even those that is not specified above.
      // tslint:disable-next-line:no-invalid-this
      return originalResolveFilename.apply(this, modifiedArguments);
    }
    // tslint:disable-next-line:no-invalid-this
    return originalResolveFilename.apply(this, arguments);
  };
}
