import * as path from "path";
import * as fs from "fs";
// tslint:disable:no-require-imports
import JSON5 = require("json5");
import StripBom = require("strip-bom");
// tslint:enable:no-require-imports

/**
 * Typing for the parts of tsconfig that we care about
 */
export interface Tsconfig {
  extends?: string;
  compilerOptions?: {
    baseUrl?: string;
    paths?: { [key: string]: Array<string> };
    strict?: boolean;
  };
}

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

  if (!configPath) {
    return {
      tsConfigPath: undefined,
      baseUrl: undefined,
      paths: undefined
    };
  }
  const config = loadTsconfig(configPath);

  return {
    tsConfigPath: configPath,
    baseUrl: config && config.compilerOptions && config.compilerOptions.baseUrl,
    paths: config && config.compilerOptions && config.compilerOptions.paths
  };
}

function resolveConfigPath(cwd: string, filename?: string): string | undefined {
  if (filename) {
    const absolutePath = fs.lstatSync(filename).isDirectory()
      ? path.resolve(filename, "./tsconfig.json")
      : path.resolve(cwd, filename);

    return absolutePath;
  }

  if (fs.statSync(cwd).isFile()) {
    return path.resolve(cwd);
  }

  const configAbsolutePath = walkForTsConfig(cwd);
  return configAbsolutePath ? path.resolve(configAbsolutePath) : undefined;
}

export function walkForTsConfig(
  directory: string,
  existsSync: (path: string) => boolean = fs.existsSync
): string | undefined {
  const configPath = path.join(directory, "./tsconfig.json");
  if (existsSync(configPath)) {
    return configPath;
  }

  const parentDirectory = path.join(directory, "../");

  // If we reached the top
  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfig(parentDirectory, existsSync);
}

export function loadTsconfig(
  configFilePath: string,
  existsSync: (path: string) => boolean = fs.existsSync,
  readFileSync: (filename: string) => string = (filename: string) =>
    fs.readFileSync(filename, "utf8")
): Tsconfig | undefined {
  if (!existsSync(configFilePath)) {
    return undefined;
  }

  // Compose a config object by looping through all tsconfig files for
  // as long as 'extends' is set
  let extensionPath: string | null = configFilePath;
  let extendsDir: string = ".";
  let config: Tsconfig = {};
  while (extensionPath !== null) {
    if (
      typeof extensionPath === "string" &&
      extensionPath.indexOf(".json") === -1
    ) {
      extensionPath += ".json";
    }

    const configString = readFileSync(extensionPath);
    const cleanedJson = StripBom(configString);
    const newConfig: Tsconfig = JSON5.parse(cleanedJson);

    // Merge new and previous config. Since the loop is walking 'backwards'
    // we need to make sure the 'old' config is prioritized over the 'new' one.
    config = {
      ...newConfig,
      ...config,
      compilerOptions: {
        ...newConfig.compilerOptions,
        ...config.compilerOptions
      }
    };

    // baseUrl should be interpreted as relative to the base tsconfig,
    // but we need to update it so it is relative to the original tsconfig being loaded
    // we therefore need to compose the 'extendsDir' path
    extendsDir = newConfig.extends
      ? path.join(extendsDir, path.dirname(newConfig.extends))
      : extendsDir;
    extensionPath = newConfig.extends
      ? path.resolve(path.dirname(extensionPath), newConfig.extends)
      : null;
  }

  if (config.compilerOptions && config.compilerOptions.baseUrl) {
    config.compilerOptions.baseUrl = path.join(
      extendsDir,
      config.compilerOptions.baseUrl
    );
  }

  return config;
}
