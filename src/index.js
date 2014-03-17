/* jshint evil: true */
var comClient   = require('./comClient.js');
var getAppender = require('./log/getAppender.js');
var logger      = require('./log/logger.js');
var eventListener = require('eventlistener');
var childrenSize  = require('./childrensize.js');

var bootStrap = function () {
    var gardr = global.gardr || {};
    if (!global.gardr) { global.gardr = gardr; }

    gardr.params = gardr.params || JSON.parse(window.name);
    gardr.id = gardr.params.id;
    gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));

    // TODO requestAnimationFrame polyfill

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
