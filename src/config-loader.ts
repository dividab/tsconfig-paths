import * as TsConfigLoader from "./tsconfig-loader";
import * as path from "path";

export interface ExplicitParams {
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> }
}

interface ConfigLoaderParams {
  tsConfigLoader?: (params: TsConfigLoader.TsConfigLoaderParams) => TsConfigLoader.TsConfigLoaderResult
  explicitParams: ExplicitParams | undefined,
  cwd: string,
}

export function configLoader({
  tsConfigLoader = TsConfigLoader.tsConfigLoader,
  explicitParams,
  cwd
}: ConfigLoaderParams) {

  if (explicitParams) {
    return {
      absoluteBaseUrl: explicitParams.absoluteBaseUrl,
      paths: explicitParams.paths
    };
  }

  // Load tsconfig and create path matching function
  const loadResult = tsConfigLoader({
    cwd,
    getEnv: (key: string) => process.env[key],
  });

  if (!loadResult.tsConfigPath) {
    throw new Error("Couldn't find tsconfig");
  }

  const tsConfigDir = path.dirname(loadResult.tsConfigPath);
  const absoluteBaseUrl = path.join(tsConfigDir, loadResult.baseUrl);

  return {
    absoluteBaseUrl,
    paths: loadResult.paths
  };
}
