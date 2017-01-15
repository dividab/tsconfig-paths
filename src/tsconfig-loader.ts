import * as Tsconfig from "tsconfig";

export interface LoadResult {
  tsConfigPath: string | undefined,
  baseUrl: string,
  paths: { [key: string]: Array<string> }
}

export interface LoadTsConfigProps {
  getEnv: (key: string) => string | undefined
  cwd: string,
  loadSync?(cwd: string, filename?: string): LoadResult;
}

export function loadTsConfig({
  getEnv,
  cwd,
  loadSync = loadSyncDefault
}: LoadTsConfigProps): LoadResult {

  const TS_NODE_PROJECT = getEnv("TS_NODE_PROJECT");

  const searchStart = TS_NODE_PROJECT || cwd;
  const loadResult = loadSync(searchStart, undefined);
  return loadResult;

}

function loadSyncDefault(cwd: string, filename?: string): LoadResult {
  // Tsconfig.loadSync uses path.resolve. This is why we can use an absolute path as filename
  const loadResult = Tsconfig.loadSync(cwd, filename);

  return {
    tsConfigPath: loadResult.path,
    baseUrl: loadResult.config.compilerOptions.baseUrl,
    paths: loadResult.config.compilerOptions.paths
  };
}
