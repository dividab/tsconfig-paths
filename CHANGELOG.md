# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
- Nothing for now

## [2.3.0]
### Changed
- Removed dependency for package `tsconfig`.
### Fixed
- Support for config inheritance with `extends`. Fixes [#17](https://github.com/jonaskello/tsconfig-paths/issues/17).


## [2.2.0]
### Fixed
- Fixed issue [#7](https://github.com/jonaskello/tsconfig-paths/issues/7).

## [2.1.2]
### Fixed
- Fixed issue [#6](https://github.com/jonaskello/tsconfig-paths/issues/6).

## [2.1.1]
### Fixed
- Fixed issue [#4](https://github.com/jonaskello/tsconfig-paths/issues/4)

## [2.1.0]
### Fixed
- Fixed issue [#3](https://github.com/jonaskello/tsconfig-paths/issues/3)

## [2.0.0]
### Added
- We now look at `process.env.TS_NODE_PROJECT`
- Functionality to bootstrap tsconfig-paths. Documentation in [README](https://github.com/jonaskello/tsconfig-paths/blob/master/README.md)

### Changed
- Changed signature for `createMatchPath`. Now only takes absoluteUrl and paths.

## [1.1.0]
### Added
- More explanation to readme.
- Match all extensions in require.extensions.
- Match longest pattern prefix first as typesript does.
- Match file in main field of package.json.
- Check for index files explicitly.

## [1.0.0] - 2016-12-30
- First stable release.

## [0.4.0] - 2016-12-30
### Changed
- Renamed project to `tsocnfig-paths`.

## [0.3.0] - 2016-12-30
### Added
- API documentation.
- `createMatchPath` function.
- `matchFromAbsolutePaths` function.
### Removed
- `findPath` function.

## [0.2.1] - 2016-12-29
### Fixed
- `tsconfig-paths/register` was not available.

## [0.2.0] - 2016-12-29
### Fixed
- Paths for files in sub-dirs.
### Added
- Programmatic use.

## [0.1.2] - 2016-12-28
### Fixed
- Fixed wrong name of the package in README.
- Add missing files on publish.

## [0.1.1] - 2016-12-28
### Added
- Loading of tsconfig.
- Example.
- Publish scripts.

## [0.1.0] - 2016-12-28
- Initial version.
