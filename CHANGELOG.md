# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
- Use `TS_NODE_PROJECT` env if exists
- Functionality to bootstrap tsconfig-paths

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
