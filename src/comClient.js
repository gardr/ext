var xde = require('cross-domain-events');

var rendered = function(origin, targetWindow, opts) { 
	var opts = opts || {};
	xde.sendTo(targetWindow, 'rendered', opts);
}

var comClient = function(origin, targetWindow) {

	return {
		rendered : rendered.bind(null, origin, targetWindow)
	}
}


module.exports = comClient;