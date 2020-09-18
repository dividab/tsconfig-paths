const { register } = require("./lib/register");
const { options } = require("./lib/options");
const { tsConfigLoader } = require("./lib/tsconfig-loader");
const path = require("path");

const tsConfig = tsConfigLoader({
  cwd: options.cwd,
  getEnv: function (key) {
    return process.env[key];
  },
});
const baseUrl = path.join(tsConfig.outDir, tsConfig.baseUrl);

register({
  baseUrl,
  paths: tsConfig.paths,
});
