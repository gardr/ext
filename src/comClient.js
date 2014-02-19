var xde = require('cross-domain-events');

var rendered = function (targetWindow, opts) { 
	var opts = opts || {};
	xde.sendTo(targetWindow, 'rendered', opts);
}

var comClient = function (targetWindow, origin) {
	if (typeof targetWindow !== 'object' || !'postMessage' in window) {
		throw new Error('targetWindow must be a Window object');
	}

	if (typeof origin !== 'string') {
		throw new Error('origin must be a string');
	}

	xde.targetOrigin = origin;
	return {
		rendered : rendered.bind(null, targetWindow)
	}
}

comClient._setXde = function (_xde) {
	xde = _xde;
}


module.exports = comClient;