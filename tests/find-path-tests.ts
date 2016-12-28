import {assert} from "chai";
import {findPath} from "../src/find-path";

describe('find-path', function () {

  it('should locate path that matches and exists', () => {
    const result = findPath("lib/mylib", "./", {"lib/*": ["location/*"]},
      (name: string) => name === "location/mylib");
    assert.equal(result, "location/mylib");
  });

  it('should not locate path that does not match', () => {
    const result = findPath("mylib", "./", {"lib/*": ["location/*"]},
      (name: string) => name === name);
    assert.equal(result, undefined);
  });

});
