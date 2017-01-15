import { createMatchPath } from "./match-path";
import { loadTsConfig } from "./tsconfig-loader";
import * as path from "path";

interface RegisterParams {
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> }
}

/**
 * Installs a custom module load function that can adhere to paths in tsconfig.
 */
export function register(params: RegisterParams) {
  const { absoluteBaseUrl, paths } = loadSettingsFromParamsOrTsConfig(params);
  const matchPath = createMatchPath(
    absoluteBaseUrl,
    paths
  );

  // Patch node's module loading
  const Module = require('module');
  const originalLoader = Module._load;
  Module._load = function (request: string, parent: any) {
    const found = matchPath(parent, request);
    if (found) {
      const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
      return originalLoader.apply(this, modifiedArguments);
    }
    return originalLoader.apply(this, arguments);
  }

}

function loadSettingsFromParamsOrTsConfig(
  params: RegisterParams | undefined
) {
  if (params) {
    return {
      absoluteBaseUrl: params.absoluteBaseUrl,
      paths: params.paths
    };
  }


  // Load tsconfig and create path matching function
  const loadResult = loadTsConfig({
    cwd: process.cwd(),
    getEnv: (key: string) => process.env[key],
  });

  if (!loadResult.tsConfigPath) {
    throw new Error("Couldn't find tsconfig");
  }

  const absoluteBaseUrl = path.dirname(path.join(loadResult.tsConfigPath, loadResult.baseUrl));
  return {
    absoluteBaseUrl,
    paths: loadResult.paths
  };
}
