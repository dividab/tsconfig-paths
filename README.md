# node-tsconfig-paths

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
`node -r node-tsconfig-paths main.js`

### With ts-node
`ts-node -r node-tsconfig-paths main.ts`

### With mocha and ts-node
`mocha --compilers ts:ts-node/register -r node-tsconfig-paths`
