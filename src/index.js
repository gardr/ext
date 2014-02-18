var hashData 	= require('gardr-iframe-params');
var extend 		= require('util-extend');
var xde 		= require('cross-domain-events');

var inside = function () {
	var gardr = {};

	extend(gardr, hashData.decode(global.location.hash));

	// TODO requestAnimationFrame polyfill
	global.gardr = gardr;
};

inside._xde = xde;

module.exports = inside;