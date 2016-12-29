import {assert} from "chai";
import {findPath} from "../src/find-path";
import * as path from "path";

describe('find-path', function () {

  it('should locate path that matches and exists', () => {
    const result = findPath("./test.ts", "lib/mylib", "./tsconfig.json", "./", {"lib/*": ["location/*"]},
      (name: string) => name === path.resolve("./", "location/mylib"));
    assert.equal(result, "./location/mylib");
  });

  it('should resolve to parent folder when filename is in subfolder', () => {
    const result = findPath("./subfolder/file.ts", "lib/mylib", "./tsconfig.json", "./", {"lib/*": ["location/*"]},
    (name: string) => name === path.resolve("./", "location/mylib"));
    assert.equal(result, "../location/mylib");
  });

  it('should not locate path that does not match', () => {
    const result = findPath("./asd.ts", "mylib", "./tsconfig.json", "./", {"lib/*": ["location/*"]},
      (name: string) => name === name);
    assert.equal(result, undefined);
  });

});
