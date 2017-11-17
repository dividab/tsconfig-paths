import { assert } from "chai";
import { tsConfigLoader, walkForTsConfig } from "../src/tsconfig-loader";

describe("tsconfig-loader", function() {
  it("should find tsconfig in cwd", () => {
    const result = tsConfigLoader({
      cwd: "/foo/bar",
      getEnv: (_: string) => undefined,
      loadSync: (cwd: string) => {
        return {
          tsConfigPath: `${cwd}/tsconfig.json`,
          baseUrl: "./",
          paths: {}
        };
      }
    });

    assert.equal(result.tsConfigPath, "/foo/bar/tsconfig.json");
  });

  it("should return loaderResult.tsConfigPath as undefined when not found", () => {
    const result = tsConfigLoader({
      cwd: "/foo/bar",
      getEnv: (_: string) => undefined,
      loadSync: (_: string) => {
        return {
          tsConfigPath: undefined,
          baseUrl: "./",
          paths: {}
        };
      }
    });

    assert.isUndefined(result.tsConfigPath);
  });

  it("should use TS_NODE_PROJECT env if exists", () => {
    const result = tsConfigLoader({
      cwd: "/foo/bar",
      getEnv: (key: string) =>
        key === "TS_NODE_PROJECT" ? "/foo/baz" : undefined,
      loadSync: (cwd: string, fileName: string) => {
        if (cwd === "/foo/bar" && fileName === "/foo/baz") {
          return {
            tsConfigPath: "/foo/baz/tsconfig.json",
            baseUrl: "./",
            paths: {}
          };
        }

        return {
          tsConfigPath: undefined,
          baseUrl: "./",
          paths: {}
        };
      }
    });

    assert.equal(result.tsConfigPath, "/foo/baz/tsconfig.json");
  });
});

describe.only("walkForTsConfig", function() {
  it("should find tsconfig in starting directory", () => {
    const res = walkForTsConfig(
      "/root/dir1",
      path => path === "/root/dir1/tsconfig.json"
    );
    assert.equal(res, "/root/dir1/tsconfig.json");
  });

  it("should find tsconfig in parent directory", () => {
    const res = walkForTsConfig(
      "/root/dir1",
      path => path === "/root/tsconfig.json"
    );
    assert.equal(res, "/root/tsconfig.json");
  });

  it("should return undefined when reaching the top", () => {
    const res = walkForTsConfig("/root/dir1/kalle", () => false);
    assert.equal(res, undefined);
  });
});
