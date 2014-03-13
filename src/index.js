/* jshint evil: true */
var hashData    = require('gardr-iframe-params');
var extend      = require('util-extend');
var comClient   = require('./comClient.js');
var getAppender = require('./log/getAppender.js');
var logger      = require('./log/logger.js');
var eventListener = require('eventlistener');
var childrenSize  = require('./childrensize.js');

var bootStrap = function (hash) {
    hash = hash || global.location.hash;
    var gardr = {};
    global.gardr = gardr;

    extend(gardr, hashData.decode(hash));
    gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));

    // TODO requestAnimationFrame polyfill

    gardr.log.debug('Loading url: ' + gardr.params.url);
    document.write('<span id="gardr">');
    document.write(['<scr', 'ipt src=\'', gardr.params.url, '\' ></scr', 'ipt>'].join(''));
    document.write('</span>');

    var com = comClient(gardr.id, window.parent, gardr.internal.origin);
    eventListener.add(global, 'load', function () {
        var size = childrenSize(document.getElementById('gardr'));
        com.rendered(size);
    });
};

bootStrap._setComClient = function (client) {
    comClient = client;
};

module.exports = bootStrap;
