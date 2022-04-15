const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {
  // eslint-disable-next-line id-denylist
  string: ["project"],
  alias: {
    project: ["P"],
  },
});

require("./").register({
  cwd: argv.project,
});
