## 1.0.0
### Breaking Changes
- iframe.htm introduces breaking change, to better support IE legacy we have to inject/write within an plain script-tag and not via a script-file. If size reporting in IE8 and IE9 are important to you, an upgrade is advised.

### Fixes
- Cross-domain-events upgraded to 0.4.0 for legacy IE support
- IE11 empty url.protocol fix for allowed domains check
