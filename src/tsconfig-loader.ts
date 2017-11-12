import * as path from "path";
import * as fs from "fs";
import * as R from "ramda";

export interface TsConfigLoaderResult {
  tsConfigPath: string | undefined;
  baseUrl: string | undefined;
  paths: { [key: string]: Array<string> } | undefined;
}

export interface TsConfigLoaderParams {
  getEnv: (key: string) => string | undefined;
  cwd: string;
  loadSync?(cwd: string, filename?: string): TsConfigLoaderResult;
}

export function tsConfigLoader({
  getEnv,
  cwd,
  loadSync = loadSyncDefault
}: TsConfigLoaderParams): TsConfigLoaderResult {
  const TS_NODE_PROJECT = getEnv("TS_NODE_PROJECT");

  // tsconfig.loadSync handles if TS_NODE_PROJECT is a file or directory
  const loadResult = loadSync(cwd, TS_NODE_PROJECT);
  return loadResult;
}

function loadSyncDefault(cwd: string, filename?: string): TsConfigLoaderResult {
  // Tsconfig.loadSync uses path.resolve. This is why we can use an absolute path as filename

  const configPath = resolveConfigPath(cwd, filename);
  const config = loadConfig(configPath);
  console.log(config);
  return {
    tsConfigPath: configPath,
    baseUrl: config && config.compilerOptions && config.compilerOptions.baseUrl,
    paths: config && config.compilerOptions && config.compilerOptions.paths
  };
}

function resolveConfigPath(cwd: string, filename?: string): string {
  if (filename) {
    const absolutePath = fs.lstatSync(filename).isDirectory()
      ? path.resolve(filename, "./tsconfig.json")
      : path.resolve(cwd, filename);

    return absolutePath;
  }

  return path.resolve(cwd, "./tsconfig.json");
}

function loadConfig(
  configFilePath: string
): { [key: string]: any } | undefined {
  if (!fs.existsSync(configFilePath)) {
    return undefined;
  }

  const config = require(configFilePath);

  if (config.extends) {
    const currentDir = path.dirname(configFilePath);
    const base = loadConfig(path.resolve(currentDir, config.extends)) || {};
    return R.mergeDeepRight(base, config);
  }
  return config;
}
