# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.0] - 2015-05-15
### Breaking Changes
- iframe.htm introduces breaking change, to better support IE legacy we have to inject/write within an plain script-tag and not via a script-file. If size reporting in IE8 and IE9 are important to you, an upgrade is advised.

### Fixes
- Cross-domain-events upgraded to 0.4.0 for legacy IE support
- IE11 empty url.protocol fix for allowed domains check
- `overflow-x` / `overflow-y` support with getting sizes in browsers(firefox) that does not compute this back to `overflow: auto`
