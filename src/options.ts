import * as minimist from "minimist";

const argv = minimist(process.argv.slice(2), {
  string: ["project"],
  alias: {
    project: ["P"]
  }
});

export interface Options {
  cwd: string;
}

export const options: Options = {
  cwd: argv.project || process.cwd()
};
