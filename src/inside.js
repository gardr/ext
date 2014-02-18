var hashData 	= require('gardr-iframe-params');
var extend 		= require('util-extend');
var xde 		= require('cross-domain-events');
var getAppender = require('./log/getAppender.js');
var logger		= require('./log/logger.js');

var inside = function () {
	var gardr = {};

	extend(gardr, hashData.decode(global.location.hash));
	gardr.log = logger.create(gardr.id, gardr.params.loglevel, getAppender(gardr.params.logto));
	debugger
	gardr.log.debug('Banner init');

	// TODO requestAnimationFrame polyfill
	global.gardr = gardr;

};

inside._xde = xde;

module.exports = inside;