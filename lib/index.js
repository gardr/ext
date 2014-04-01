/* jshint evil: true */
var comClient   = require('./comClient.js');
var getAppender = require('./log/getAppender.js');
var logger      = require('./log/logger.js');
var eventListener = require('eventlistener');
var childrenSize  = require('./childrensize.js');
var pluginCore = require('gardr-core-plugin');

function readParams () {
    // Params are passed as a JSON in the url fragment by default. IE has a limit for URLs longer than 2083 bytes, so
    // fallback to iframe.name if there is no url fragment.
    // We can't only rely on iframe.name because WebViews from native apps don't use an iframe, and it's currently no
    // easy way to define window.name synchronously before the document is loaded on iOS.
    var urlFragment = decodeURIComponent(document.location.hash.substring(1));
    return JSON.parse(urlFragment || window.name);
}

var bootStrap = function () {
    var gardr = global.gardr || {};
    var pluginApi = new pluginCore.PluginApi();
    if (!global.gardr) {
        global.gardr = gardr;
        gardr.params = readParams();
    }
    pluginCore.pluginHandler.initPlugins(pluginApi);

    gardr.id = gardr.params.id;
    pluginApi.trigger('params:parsed', gardr.params);
    gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));

    // TODO requestAnimationFrame polyfill

    gardr.log.debug('Loading url: ' + gardr.params.url);

    document.write(['<span id="gardr"><scr', 'ipt src="', gardr.params.url, '" ></scr', 'ipt></span>'].join(''));

    gardr.container = document.getElementById('gardr');
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
