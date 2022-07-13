# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Change categories are:

* `Added` for new features.
* `Changed` for changes in existing functionality.
* `Deprecated` for once-stable features removed in upcoming releases.
* `Removed` for deprecated features removed in this release.
* `Fixed` for any bug fixes.
* `Security` to invite users to upgrade in case of vulnerabilities.

## Unreleased
### Added
### Changed
### Deprecated
### Fixed
### Removed
### Security

## [0.0.9](https://github.com/saibotsivad/mongodb-local-data-api/compare/v0.0.8...v0.0.9) - 2022-07-13
### Fixed
- The `deleteMany` was being called incorrectly.

## [0.0.7-0.0.8](https://github.com/saibotsivad/mongodb-local-data-api/compare/v0.0.6...v0.0.8) - 2022-05-25
### Added
- If scanned results is over 1000, will log an error. (This more closely matches the behaviour of MongoDB Atlas.)
### Changed
- Log output with and without the `--verbose` flag is cleaner.

## [0.0.6](https://github.com/saibotsivad/mongodb-local-data-api/compare/v0.0.5...v0.0.6) - 2022-02-10
### Fixed
- The `findOne` method being called incorrectly. 🤦‍♂️ I hadn't noticed until now because I so rarely use that specific method.

## [0.0.4-0.0.5](https://github.com/saibotsivad/mongodb-local-data-api/compare/v0.0.3...v0.0.5) - 2022-01-28
### Added
- If the connection to MongoDB gets dropped, it'll try to reconnect. You can control the number of times using the `retryCount` option.
### Fixed
- Added the `verbose` option to the docs.
- Corrected the examples for `sade`.

## [0.0.2-0.0.3](https://github.com/saibotsivad/mongodb-local-data-api/compare/v0.0.1...v0.0.3) - 2022-01-27
### Fixed
- The `insertOne` and `find` operations were incorrect.

## [0.0.1](https://github.com/saibotsivad/mongodb-local-data-api/compare/v0.0.0...v0.0.1)
### Fixed
- Docs for options were incomplete.

## [0.0.0](https://github.com/saibotsivad/mongodb-local-data-api/tree/v0.0.0) - 2022-01-26
### Added
- Created the base project from [saibotsivad/init](https://github.com/saibotsivad/init).
- First pass at making it an accurate copy of the existing Data API, warts and all.
