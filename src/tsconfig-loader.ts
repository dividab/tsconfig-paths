import * as Tsconfig from "tsconfig";

export interface TsConfigLoaderResult {
  tsConfigPath: string | undefined,
  baseUrl: string,
  paths: { [key: string]: Array<string> }
}

export interface TsConfigLoaderParams {
  getEnv: (key: string) => string | undefined
  cwd: string,
  loadSync?(cwd: string, filename?: string): TsConfigLoaderResult;
}

export function tsConfigLoader({
  getEnv,
  cwd,
  loadSync = loadSyncDefault
}: TsConfigLoaderParams): TsConfigLoaderResult {

  const TS_NODE_PROJECT = getEnv("TS_NODE_PROJECT");

  const searchStart = TS_NODE_PROJECT || cwd;
  const loadResult = loadSync(searchStart, undefined);
  return loadResult;

}

function loadSyncDefault(cwd: string, filename?: string): TsConfigLoaderResult {
  // Tsconfig.loadSync uses path.resolve. This is why we can use an absolute path as filename
  const loadResult = Tsconfig.loadSync(cwd, filename);

  return {
    tsConfigPath: loadResult.path,
    baseUrl: loadResult.config.compilerOptions.baseUrl,
    paths: loadResult.config.compilerOptions.paths
  };
}
