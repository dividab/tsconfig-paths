import { assert } from "chai";
import { matchStar } from "../src/match-star";

describe("match-star", () => {
  it("should match star in last position", () => {
    const result = matchStar("lib/*", "lib/mylib");
    assert.equal(result, "mylib");
  });
  it("should match star in first position", () => {
    const result = matchStar("*/lib", "mylib/lib");
    assert.equal(result, "mylib");
  });
});
