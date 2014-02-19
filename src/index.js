var hashData 	= require('gardr-iframe-params');
var extend 		= require('util-extend');
// var xde 		= require('cross-domain-events');
var comClient   = require('./comClient.js');
var getAppender = require('./log/getAppender.js');
var logger		= require('./log/logger.js');
var eventListener = require('eventlistener');

var bootStrap = function (hash) {
	var gardr = {};

	extend(gardr, hashData.decode(hash));
	gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));
	
	// TODO requestAnimationFrame polyfill
	global.gardr = gardr;

	gardr.log.debug('Loading url: ' + gardr.params.url);
	document.write(['<scr', 'ipt src=\'', gardr.params.url, '\' ></scr', 'ipt>'].join(''));

	//on load
	var com = comClient(window.top, gardr.internal.origin);
	eventListener.add(global, 'load', function (e) {
		com.rendered();
	});
};

bootStrap._setComClient = function (client) {
	comClient = client;
}

module.exports = bootStrap;

if (global.location.hash) {
	bootStrap(global.location.hash);
}