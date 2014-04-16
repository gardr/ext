/* jshint evil: true */
var comClient   = require('./comClient.js');
var getAppender = require('./log/getAppender.js');
var logger      = require('./log/logger.js');
var eventListener = require('eventlistener');
var childrenSize  = require('./childrensize.js');
var UNIQUE_TOKEN_REGEX = /(GARDR|PASTIES)_UNIQUE_ID/;

function readParams () {
    // Params are passed as a JSON in the url fragment by default. IE has a limit for URLs longer than 2083 bytes, so
    // fallback to iframe.name if there is no url fragment.
    // We can't only rely on iframe.name because WebViews from native apps don't use an iframe, and it's currently no
    // easy way to define window.name synchronously before the document is loaded on iOS.
    var urlFragment = decodeURIComponent(document.location.hash.substring(1));
    return JSON.parse(urlFragment || window.name);
}

function replaceUniqueToken (url, id) {
    // We cannot use a global regex because of this bug:
    // // http://stackoverflow.com/questions/3827456/what-is-wrong-with-my-date-regex/3827500#3827500
    while (url && UNIQUE_TOKEN_REGEX.test(url)) {
        url = url.replace(UNIQUE_TOKEN_REGEX, '' + new Date().getTime() + (id));
    }
    return url;
}

var bootStrap = function () {
    var gardr = global.gardr || {};
    if (!global.gardr) {
        global.gardr = gardr;
        gardr.params = readParams();
    }
    gardr.id = gardr.params.id;
    gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));

    // TODO requestAnimationFrame polyfill

    gardr.params.url = replaceUniqueToken(gardr.params.url, gardr.id);

    gardr.log.debug('Loading url: ' + gardr.params.url);
    document.write('<span id="gardr">');
    document.write(['<scr', 'ipt src=\'', gardr.params.url, '\' ></scr', 'ipt>'].join(''));
    document.write('</span>');

    var com = comClient(gardr.id, window.parent, gardr.params.origin);
    eventListener.add(global, 'load', function () {
        // phantomjs doesn't calculate sizes correctly unless we give it a break
        setTimeout(function () {
            var size = childrenSize(document.getElementById('gardr'));
            com.rendered(size);
        }, 0);
    });
};

bootStrap._setComClient = function (client) {
    comClient = client;
};

module.exports = bootStrap;
