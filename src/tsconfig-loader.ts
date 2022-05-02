import * as path from "path";
import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import JSON5 = require("json5");
// eslint-disable-next-line @typescript-eslint/no-require-imports
import StripBom = require("strip-bom");

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
  loadSync?(
    cwd: string,
    filename?: string,
    baseUrl?: string
  ): TsConfigLoaderResult;
}

export function tsConfigLoader({
  getEnv,
  cwd,
  loadSync = loadSyncDefault,
}: TsConfigLoaderParams): TsConfigLoaderResult {
  const TS_NODE_PROJECT = getEnv("TS_NODE_PROJECT");
  const TS_NODE_BASEURL = getEnv("TS_NODE_BASEURL");

  // tsconfig.loadSync handles if TS_NODE_PROJECT is a file or directory
  // and also overrides baseURL if TS_NODE_BASEURL is available.
  const loadResult = loadSync(cwd, TS_NODE_PROJECT, TS_NODE_BASEURL);
  return loadResult;
}

function loadSyncDefault(
  cwd: string,
  filename?: string,
  baseUrl?: string
): TsConfigLoaderResult {
  // Tsconfig.loadSync uses path.resolve. This is why we can use an absolute path as filename

  const configPath = resolveConfigPath(cwd, filename);

  if (!configPath) {
    return {
      tsConfigPath: undefined,
      baseUrl: undefined,
      paths: undefined,
    };
  }
  const config = loadTsconfig(configPath);

  return {
    tsConfigPath: configPath,
    baseUrl:
      baseUrl ||
      (config && config.compilerOptions && config.compilerOptions.baseUrl),
    paths: config && config.compilerOptions && config.compilerOptions.paths,
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
  readdirSync: (path: string) => string[] = fs.readdirSync
): string | undefined {
  const files = readdirSync(directory);
  const filesToCheck = ["tsconfig.json", "jsconfig.json"];
  for (const fileToCheck of filesToCheck) {
    if (files.indexOf(fileToCheck) !== -1) {
      return path.join(directory, fileToCheck);
    }
  }

  const parentDirectory = path.dirname(directory);

  // If we reached the top
  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfig(parentDirectory, readdirSync);
}

export function loadTsconfig(
  configFilePath: string,
  // eslint-disable-next-line no-shadow
  existsSync: (path: string) => boolean = fs.existsSync,
  readFileSync: (filename: string) => string = (filename: string) =>
    fs.readFileSync(filename, "utf8"),
  visited: Record<string, boolean> = {}
): Tsconfig | undefined {
  // Don't infinite loop if a series of "extends" links forms a cycle
  if (visited[configFilePath]) {
    return undefined;
  }
  visited[configFilePath] = true;

  if (!existsSync(configFilePath)) {
    return undefined;
  }

  const configString = readFileSync(configFilePath);
  const cleanedJson = StripBom(configString);
  const config: Tsconfig = JSON5.parse(cleanedJson);

  const base = getExtendedConfig(
    config,
    configFilePath,
    visited,
    existsSync,
    readFileSync
  );

  if (
    config.compilerOptions?.baseUrl &&
    !path.isAbsolute(config.compilerOptions.baseUrl)
  ) {
    const fileDir = path.dirname(configFilePath);
    config.compilerOptions.baseUrl = path.join(
      fileDir,
      config.compilerOptions.baseUrl
    );
  }

  return {
    ...base,
    ...config,
    compilerOptions: {
      ...base?.compilerOptions,
      ...config.compilerOptions,
    },
  };
}

function getExtendedConfig(
  sourceConfig: Tsconfig,
  sourceConfigFilePath: string,
  visited: Record<string, boolean>,
  existsSync: (path: string) => boolean,
  readFileSync: (filename: string) => string
): Tsconfig | undefined {
  let extendedConfig = sourceConfig.extends;
  if (!extendedConfig) {
    return undefined;
  }

  const extendedConfigPath = getExtendedConfigPath(
    extendedConfig,
    sourceConfigFilePath,
    existsSync
  );
  if (!extendedConfigPath) {
    return undefined;
  }

  return loadTsconfig(extendedConfigPath, existsSync, readFileSync, visited);
}

function getExtendedConfigPath(
  extendedConfig: string,
  sourceConfigFilePath: string,
  existsSync: (path: string) => boolean
): string | undefined {
  const currentDir = path.dirname(sourceConfigFilePath);
  // If this is a package path, try to resolve it to a "node_modules" folder.
  if (isPackagePath(extendedConfig)) {
    return forEachAncestorDirectory(currentDir, (ancestor) => {
      // Skip "node_modules" folders
      if (path.basename(ancestor) !== "node_modules") {
        const extendedPackage = path.join(
          ancestor,
          "node_modules",
          extendedConfig
        );
        const fileToCheck = [
          extendedPackage,
          path.join(extendedPackage, "tsconfig.json"),
          `${extendedPackage}.json`,
        ];
        return fileToCheck.find(existsSync);
      }
      return undefined;
    });
  } else {
    // If this is a regular path, search relative to the enclosing directory
    let extendedConfigPath = extendedConfig;
    if (!path.isAbsolute(extendedConfig)) {
      extendedConfigPath = path.join(currentDir, extendedConfig);
    }
    if (extendedConfigPath.indexOf(".json") === -1) {
      extendedConfigPath += ".json";
    }
    return extendedConfigPath;
  }
}

/**
 * Calls `callback` on `directory` and every ancestor directory it has, returning the first defined result.
 */
export function forEachAncestorDirectory<T>(
  directory: string,
  callback: (directory: string) => T | undefined
): T | undefined {
  while (true) {
    const result = callback(directory);
    if (result !== undefined) {
      return result;
    }

    const parentPath = path.dirname(directory);
    if (parentPath === directory) {
      return undefined;
    }

    directory = parentPath;
  }
}

// Package paths are loaded from a "node_modules" directory. Non-package paths
// are relative or absolute paths.
function isPackagePath(dir: string): boolean {
  return (
    !dir.startsWith("/") && !dir.startsWith("./") && !dir.startsWith("../")
  );
}
