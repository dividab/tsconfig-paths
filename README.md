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

There is one function, `findPath()` that is exported for programmatic use.
For now see the tests how to call it.

```
import {findPath} from "node-tsconfig-paths";
findPath(...)
```
