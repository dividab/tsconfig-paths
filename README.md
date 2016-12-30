# tsconfig-paths

[![NPM version][npm-image]][npm-url]

Use this to load modules whose location is specified in the `paths` section of `tsconfig.json`. Both loading at run-time and via API are supported.

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

### With mocha and ts-node
`mocha --compilers ts:ts-node/register -r tsconfig-paths/register`

[npm-image]: https://img.shields.io/npm/v/tsconfig-paths.svg?style=flat
[npm-url]: https://www.npmjs.com/package/tsconfig-paths

## Programmatic use

The API consists of these functions:

#### `createMatchPath(tsConfigPath, baseUrl, paths)`
This function will create a function that can match paths. It accepts `baseUrl` and `paths` directly as they are specified in tsconfig and will handle resolving paths to absolute form. The created function has this signature: `matchPath(absoluteSourceFileName: string, requestedModule: string)`

#### `matchFromAbsolutePaths(absolutePaths, absoluteSourceFileName, requestedModule)`
This function is lower level and requries that the paths as already been resolved to absolute form.
