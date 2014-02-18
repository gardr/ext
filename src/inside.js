var hashData 	= require('gardr-iframe-params');
var extend 		= require('util-extend');
var xde 		= require('cross-domain-events');
var getAppender = require('./log/getAppender.js');
var logger		= require('./log/logger.js');

var inside = function () {
	var gardr = {};

	extend(gardr, hashData.decode(global.location.hash));
	gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));
	
	// TODO requestAnimationFrame polyfill
	global.gardr = gardr;

	console.log('Loading url: ' + gardr.params.url);
	document.write(['<scr', 'ipt src=\'', gardr.params.url, '\' ></scr', 'ipt>'].join(''));
};

inside._xde = xde;

module.exports = inside;