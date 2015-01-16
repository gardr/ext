/* jshint evil: true */
var comClient   = require('./comClient.js');
var getAppender = require('./log/getAppender.js');
var logger      = require('./log/logger.js');
var eventListener = require('eventlistener');
var childrenSize  = require('./childrensize.js');
var pluginCore   = require('gardr-core-plugin');
var defineOpts   = require('define-options');
var extend       = require('util-extend');

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
    var urlFragment = document.location.href.split('#')[1];
    if (urlFragment) { urlFragment = decodeURIComponent(urlFragment); }
    var params = JSON.parse(urlFragment || window.name);
    checkAllowedDomains(allowedDomains, params);
    return params;
}

function checkAllowedDomains (allowedDomains, params) {
    var a=document.createElement('a');
    a.href=params.url;
    if (a.protocol !== ':' && a.protocol.indexOf('http') === -1) {
        throw new Error('url protocol is "' + a.protocol.replace(':','') + '", but have to be http/https');
    }
    var sameDomain = (!a.hostname || a.hostname == location.hostname);
    if (!sameDomain && allowedDomains.indexOf(a.hostname) == -1) {
        throw new Error('Script ' + params.url + ' is not on a allowed domain.');
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

    // TODO requestAnimationFrame polyfill

    gardr.log.debug('Loading url: ' + gardr.params.url);

    document.write(['<div id="gardr"><scr', 'ipt src="', gardr.params.url, '" ></scr', 'ipt></div>'].join(''));

    gardr.container = document.getElementById('gardr');
    gardr.container.style.overflow = 'hidden'; // avoid iOS Safari bug http://stackoverflow.com/q/6721310
    pluginApi.trigger('element:containercreated', gardr.container);

    var com = comClient(gardr.id, window.parent, gardr.params.origin);
    eventListener.add(global, 'load', function () {
        // phantomjs doesn't calculate sizes correctly unless we give it a break
        setTimeout(function () {
            var size = childrenSize(gardr.container);
            pluginApi.trigger('banner:rendered', size);
            com.rendered(size);
        }, 0);
    });
};

bootStrap._setComClient = function (client) {
    comClient = client;
};

bootStrap.plugin = function (plugin) {
    pluginCore.pluginHandler.register(plugin);
};

module.exports = bootStrap;
