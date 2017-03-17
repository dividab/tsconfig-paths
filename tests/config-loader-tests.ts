import { assert } from "chai";
import { configLoader, ConfigLoaderFailResult, ConfigLoaderSuccessResult } from "../src/config-loader";

describe('config-loader', function () {

  it('should use explicitParams when set', () => {
    const result = configLoader({
      explicitParams: {
        baseUrl: "/foo/bar",
        paths: {
          "asd": ["asd"]
        }
      },
      cwd: "/baz"
    });

    const successResult = result as ConfigLoaderSuccessResult;
    assert.equal(successResult.resultType, "success");
    assert.equal(successResult.absoluteBaseUrl, "/foo/bar");
    assert.equal(successResult.paths["asd"][0], "asd");
  });

  it('should use explicitParams when set and add cwd when path is relative', () => {
    const result = configLoader({
      explicitParams: {
        baseUrl: "bar/",
        paths: {
          "asd": ["asd"]
        }
      },
      cwd: "/baz"
    });

    const successResult = result as ConfigLoaderSuccessResult;
    assert.equal(successResult.resultType, "success");
    assert.equal(successResult.absoluteBaseUrl, "/baz/bar/");
  });

  it('should fallback to tsConfigLoader when explicitParams is not set', () => {
    const result = configLoader({
      explicitParams: undefined,
      cwd: "/baz",
      tsConfigLoader: (_: any) => ({
        tsConfigPath: "/baz/tsconfig.json",
        baseUrl: "./src",
        paths: {}
      })
    });

    const successResult = result as ConfigLoaderSuccessResult;
    assert.equal(successResult.resultType, "success");
    assert.equal(successResult.absoluteBaseUrl, "/baz/src");
  });

  it('should show an error message when baseUrl is missing', () => {
    const result = configLoader({
      explicitParams: undefined,
      cwd: "/baz",
      tsConfigLoader: (_: any) => ({
        tsConfigPath: "/baz/tsconfig.json",
        baseUrl: undefined,
        paths: {}
      })
    });

    const failResult = result as ConfigLoaderFailResult
    assert.equal(failResult.resultType, "failed");
    assert.isTrue(failResult.message.indexOf("baseUrl") > -1);
  });

  it('should show an error message when paths is missing', () => {
    const result = configLoader({
      explicitParams: undefined,
      cwd: "/baz",
      tsConfigLoader: (_: any) => ({
        tsConfigPath: "/baz/tsconfig.json",
        baseUrl: "./src",
        paths: undefined
      })
    });

    const failResult = result as ConfigLoaderFailResult
    assert.equal(failResult.resultType, "failed");
    assert.isTrue(failResult.message.indexOf("paths") > -1);
  });

});
