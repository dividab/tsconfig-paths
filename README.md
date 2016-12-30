# node-tsconfig-paths

[![NPM version][npm-image]][npm-url]

Use this to enable execution of files whose location is specified in the `paths` section of `tsconfig.json`.

## How to install

```
yarn add --dev node-tsconfig-paths
```
or
```
npm install --save-dev node-tsconfig-paths
```

## How to use

### With node
`node -r node-tsconfig-paths/register main.js`

### With ts-node
`ts-node -r node-tsconfig-paths/register main.ts`

### With mocha and ts-node
`mocha --compilers ts:ts-node/register -r node-tsconfig-paths/register`

[npm-image]: https://img.shields.io/npm/v/node-tsconfig-paths.svg?style=flat
[npm-url]: https://www.npmjs.com/package/node-tsconfig-paths

## Programmatic use

The API consists of these functions:

#### `createMatchPath(tsConfigPath, baseUrl, paths)`
This function will create a function that can match paths. It accepts `baseUrl` and `paths` directly as they are specified in tsconfig and will handle resolving paths to absolute form. The created function has this signature: `matchPath(absoluteSourceFileName: string, requestedModule: string)`

#### `matchFromAbsolutePaths(absolutePaths, absoluteSourceFileName, requestedModule)`
This function is lower level and requries that the paths as already been resolved to absolute form.
