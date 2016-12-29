import {assert} from "chai";
import {findPath} from "../src/find-path";

describe('find-path', function () {

  it('should locate path that matches and exists', () => {
    const result = findPath(undefined, "lib/mylib", "./", {"lib/*": ["location/*"]},
      (name: string) => name === "location/mylib");
    assert.equal(result, "location/mylib");
  });

  it('should resolve to parent folder when filename is in subfolder', () => {
    const result = findPath("subfolder/file.ts", "lib/mylib", "./", {"lib/*": ["location/*"]},
      (name: string) => name === "../location/mylib");
    assert.equal(result, "../location/mylib");
  });

  it('should not locate path that does not match', () => {
    const result = findPath(undefined, "mylib", "./", {"lib/*": ["location/*"]},
      (name: string) => name === name);
    assert.equal(result, undefined);
  });

});
