/* jshint evil: true */
var comClient     = require('./comClient.js');
var getAppender   = require('./log/getAppender.js');
var logger        = require('./log/logger.js');
var eventListener = require('eventlistener');
var childrenSize  = require('./childrensize.js');
var refreshHandle = require('./refresh.js');
var pluginCore    = require('gardr-core-plugin');
var defineOpts    = require('define-options');
var extend        = require('util-extend');
var doc           = document;
var win           = window;

var defaultOpts = {
    allowedDomains: []
};

var rDomainName = /^[a-zA-Z0-9.-]+$/;
function isDomainValid (domainName) {
    if (!rDomainName.test(domainName)) {
        throw new Error('allowedDomains should only contain the hostname. Invalid domain: ' + domainName);
    }
}

function readParams (allowedDomains) {
    // Params are passed as a JSON in the url fragment by default. IE has a limit for URLs longer than 2083 bytes, so
    // fallback to iframe.name if there is no url fragment.
    // We can't only rely on iframe.name because WebViews from native apps don't use an iframe, and it's currently no
    // easy way to define window.name synchronously before the document is loaded on iOS.

    // Don't use location.hash until Firefox fixes this bug: https://bugzilla.mozilla.org/show_bug.cgi?id=483304
    var urlFragment = doc.location.href.split('#')[1];
    if (urlFragment) { urlFragment = decodeURIComponent(urlFragment); }
    var params = JSON.parse(urlFragment || win.name);
    checkAllowedDomains(allowedDomains, params);
    return params;
}

function checkAllowedDomains (allowedDomains, params) {
    var a = doc.createElement('a');
    a.href = params.url;
    // IE11 does not resolve relative urls, e.g. protocol will be empty in certain schenarios.
    if (a.protocol !== '' && a.protocol !== ':' && a.protocol.indexOf('http') === -1) {
        throw new Error('Gardr script url protocol is "' + a.protocol.replace(':','') + '", but have to be http/https');
    }
    var sameDomain = (!a.hostname || a.hostname == location.hostname);
    if (!sameDomain && allowedDomains.indexOf(a.hostname) == -1) {
        throw new Error('Gardr script ' + params.url + ' is not on a allowed domain.');
    }
}

var validate = defineOpts({
    allowedDomains : '?|string[] - Required array with allowed domains'
});

function validateOpts (options) {
    validate(options);
    options.allowedDomains.forEach(isDomainValid);
}

var bootStrap = function (options) {
    options =  extend(extend({}, defaultOpts), options);
    validateOpts(options);
    var gardr = global.gardr = {};
    var pluginApi = new pluginCore.PluginApi();

    gardr.params = readParams(options.allowedDomains);
    pluginCore.pluginHandler.initPlugins(pluginApi, options);

    pluginApi.trigger('params:parsed', gardr.params);
    gardr.id = gardr.params.id;

    gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));
    // IE 8 and 9 will not write into correct container (!) if we document.write directly from script-file-context.
    gardr.inject = function inject() {
        gardr.log.debug('Loading url: ' + gardr.params.url);
        var str = ['<scr', 'ipt id="gardr-injected-script" type="text/javascript" src="',
            gardr.params.url, '"></scr', 'ipt>'].join('');
        doc.write(str);
        gardr.container = doc.getElementById('gardr-injected-script').parentNode;
        pluginApi.trigger('element:containercreated', gardr.container);
    };

    var com = comClient(gardr.id, win.parent, gardr.params.origin);

    refreshHandle(com, win);

    eventListener.add(doc, 'readystatechange', function readyStateChange() {
        if (/interactive|complete/.test(doc.readyState)) {
            var size = childrenSize(gardr.container);
            pluginApi.trigger('banner:' + doc.readyState, size);
            com.rendered(size);
        }
    });

    // Faster in some IE versions
    eventListener.add(doc, 'DOMContentLoaded', function domContentLoaded() {
        var size = childrenSize(gardr.container);
        pluginApi.trigger('banner:domcontentloaded, size);
        com.rendered(size);
    });

    eventListener.add(global, 'load', function onloadDelayedHandler() {
        var size = childrenSize(gardr.container);
        pluginApi.trigger('banner:rendered', size);
        com.rendered(size);
    });

    return gardr;
};

bootStrap._mock = function (_doc, _win) {
    doc = _doc;
    win = _win;
};

bootStrap.plugin = function (plugin) {
    pluginCore.pluginHandler.register(plugin);
};

module.exports = bootStrap;
