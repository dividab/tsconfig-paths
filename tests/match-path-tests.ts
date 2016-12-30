import {assert} from "chai";
import {createMatchPath} from "../src/match-path";

describe('find-path', function () {

  it('should locate path that matches with star and exists', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", {"lib/*": ["location/*"]});
    const result = matchPath("/root/test.ts", "lib/mylib",
      (name: string) => name === "/root/location/mylib"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should locate path that matches without star and exists', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", {"lib/foo": ["location/foo"]});
    const result = matchPath("/root/test.ts", "lib/foo",
      (name: string) => name === "/root/location/foo"
    );
    assert.equal(result, "/root/location/foo");
  });

  it('should resolve to parent folder when filename is in subfolder', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", {"lib/*": ["location/*"]});
    const result = matchPath("/root/subfolder/file.ts", "lib/mylib",
      (name: string) => name === "/root/location/mylib"
    );
    assert.equal(result, "/root/location/mylib");
  });

  it('should not locate path that does not match', () => {

    const matchPath = createMatchPath("/root/tsconfig.json", "./", {"lib/*": ["location/*"]});
    const result = matchPath("/root/asd.ts", "mylib",
      (name: string) => name === "root/location/mylib");
    assert.equal(result, undefined);
  });

});
