# tsconfig-paths

[![npm version][version-image]][version-url]
[![travis build][travis-image]][travis-url]
[![coveralls coverage][coveralls-image]][coveralls-url]
[![MIT license][license-image]][license-url]
[![code style: prettier][prettier-image]][prettier-url]

Use this to load modules whose location is specified in the `paths` section of `tsconfig.json`. Both loading at run-time and via API are supported.

Typescript by default mimics the Node.js runtime resolution strategy of modules. But it also allows the use of [path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html) which allows arbitrary module paths (that doesn't start with "/" or ".") to be specified and mapped to physical paths in the filesystem. The typescript compiler can resolve these paths from `tsconfig` so it will compile OK. But if you then try to exeute the compiled files with node (or ts-node), it will only look in the `node_modules` folders all the way up to the root of the filesystem and thus will not find the modules specified by `paths` in `tsconfig`.

If you require this package's `tsconfig-paths/register` module it will read the `paths` from `tsconfig.json` and convert node's module loading calls into to physcial file paths that node can load.

## How to install

```
yarn add --dev tsconfig-paths
```
or
```
npm install --save-dev tsconfig-paths
```

## How to use

### With node
`node -r tsconfig-paths/register main.js`

### With ts-node
`ts-node -r tsconfig-paths/register main.ts`

If `process.env.TS_NODE_PROJECT` is set it will be used to resolved tsconfig.json

### With webpack

For webpack please use the [tsconfig-paths-webpack-plugin](https://github.com/dividab/tsconfig-paths-webpack-plugin).

### With mocha and ts-node
As of Mocha >= 4.0.0 the `--compiler` was [deprecated](https://github.com/mochajs/mocha/wiki/compilers-deprecation). Instead `--require` should be used. You also have to specify a glob that includes `.ts` files because mocha looks after files with `.js` extension by default.

```bash
mocha -r ts-node/register -r tsconfig-paths/register "test/**/*.ts"
```

### Bootstrap tsconfig-paths with explicit params
If you want more granular control over tsconfig-paths you can bootstrap it. This can be useful if you for instance have compiled with `tsc` to another directory where `tsconfig.json` doesn't exists.
```javascript
const tsConfig = require("./tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./"; // Either absolute or relative path. If relative it's resolved to current working directory.
tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths
});
```
Then run with:

`node -r ./tsconfig-paths-bootstrap.js main.js`

## Configuration Options

You can set options by passing them before the script path, via programmatic usage or via environment variables.

```bash
ts-node --project customLocation/tsconfig.json -r tsconfig-paths/register "test/**/*.ts"
```

### CLI and Programmatic Options

_Environment variable denoted in parentheses._

* `-P, --project [path]` Path to TypeScript JSON project file (`TS_NODE_PROJECT`)

## Config loading process
1. Use explicit params passed to register
2. Use `process.env.TS_NODE_PROJECT` to resolve tsConfig.json and the specified baseUrl and paths.
3. Resolves tsconfig.json from current working directory and the specified baseUrl and paths.

## Programmatic use

The public API consists of these functions:

### loadConfig

```typescript
export function loadConfig(cwd: string = process.cwd()): ConfigLoaderResult

export type ConfigLoaderResult =
  | ConfigLoaderSuccessResult
  | ConfigLoaderFailResult;

export interface ConfigLoaderSuccessResult {
  resultType: "success";
  absoluteBaseUrl: string;
  paths: { [key: string]: Array<string> };
}

export interface ConfigLoaderFailResult {
  resultType: "failed";
  message: string;
}
```

This function loads the tsconfig.json. It will start searching from the specified `cwd` directory.

### createMatchPath

```typescript
/**
 * Function that can match a path
 */
export interface MatchPath {
  (
    requestedModule: string,
    readJson?: Filesystem.ReadJsonSync,
    fileExists?: (name: string) => boolean,
    extensions?: ReadonlyArray<string>
  ): string | undefined;
}

/**
 * Creates a function that can resolve paths according to tsconfig paths property.
 * @param tsConfigPath The paths where tsconfig.json is located.
 * @param baseUrl The baseUrl specified in tsconfig.
 * @param paths The paths specified in tsconfig.
 */
export function createMatchPath(
  absoluteBaseUrl: string,
  paths: { [key: string]: Array<string> }
): MatchPath
```

The `createMatchPath` function will create a function that can match paths. It accepts `baseUrl` and `paths` directly as they are specified in tsconfig and will handle resolving paths to absolute form. The created function has the signare specified by the type `MatchPath` above.

### matchFromAbsolutePaths

```typescript
/**
 * Finds a path from tsconfig that matches a module load request.
 * @param absolutePathMappings The paths to try as specified in tsconfig but resolved to absolute form.
 * @param requestedModule The required module name.
 * @param readJson Function that can read json from a path (useful for testing).
 * @param fileExists Function that checks for existance of a file at a path (useful for testing).
 * @param extensions File extensions to probe for (useful for testing).
 * @returns the found path, or undefined if no path was found.
 */
export function matchFromAbsolutePaths(
  absolutePathMappings: ReadonlyArray<MappingEntry.MappingEntry>,
  requestedModule: string,
  readJson: Filesystem.ReadJsonSync = Filesystem.readJsonFromDiskSync,
  fileExists: Filesystem.FileExistsSync = Filesystem.fileExistsSync,
  extensions: Array<string> = Object.keys(require.extensions)
): string | undefined
```

This function is lower level and requries that the paths as already been resolved to absolute form and sorted in correct order into an array.

### createMatchPathAsync

This is the async version of `createMatchPath`. It has the same signature but with a callback parameter for the result.

### matchFromAbsolutePathsAsync

This is the async version of `matchFromAbsolutePaths`. It has the same signature but with a callback parameter for the result.

[version-image]: https://img.shields.io/npm/v/tsconfig-paths.svg?style=flat
[version-url]: https://www.npmjs.com/package/tsconfig-paths
[travis-image]: https://travis-ci.org/dividab/tsconfig-paths.svg?branch=master&style=flat
[travis-url]: https://travis-ci.org/dividab/tsconfig-paths
[coveralls-image]: https://coveralls.io/repos/github/dividab/tsconfig-paths/badge.svg?style=flat
[coveralls-url]: https://coveralls.io/github/dividab/tsconfig-paths
[license-image]: https://img.shields.io/github/license/dividab/tsconfig-paths.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
