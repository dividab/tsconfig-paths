# tsconfig-paths

[![npm version][version-image]][version-url]
[![travis build][travis-image]][travis-url]
[![codecov coverage][codecov-image]][codecov-url]
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

## Config loading process
1. Use explicit params passed to register
2. Use `process.env.TS_NODE_PROJECT` to resolve tsConfig.json and the specified baseUrl and paths.
3. Resolves tsconfig.json from current working directory and the specified baseUrl and paths.

## Programmatic use

The API consists of these functions:

#### `createMatchPath(absoluteBaseUrl, paths)`
This function will create a function that can match paths. It accepts `baseUrl` and `paths` directly as they are specified in tsconfig and will handle resolving paths to absolute form. The created function has this signature:
`(sourceFileName: string, requestedModule: string, readPackageJson: (packageJsonPath: string) => any, fileExists: any, extensions?: Array<string>)`

#### `matchFromAbsolutePaths(absolutePathMappings)`
Same structure as paths in tsconfig but all paths needs to be resolved to absolute paths. This function is lower level and requries that the paths as already been resolved to absolute form.

[version-image]: https://img.shields.io/npm/v/tsconfig-paths.svg?style=flat
[version-url]: https://www.npmjs.com/package/tsconfig-paths
[travis-image]: https://travis-ci.org/jonaskello/tsconfig-paths.svg?branch=master&style=flat
[travis-url]: https://travis-ci.org/jonaskello/tsconfig-paths
[codecov-image]: https://img.shields.io/codecov/c/github/jonaskello/tsconfig-paths/master.svg?style=flat
[codecov-url]: https://codecov.io/gh/jonaskello/tsconfig-paths/branch/master
[license-image]: https://img.shields.io/github/license/jonaskello/tsconfig-paths.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
