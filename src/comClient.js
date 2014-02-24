var xde = require('cross-domain-events');
var extend = require('util-extend');

function rendered (posId, targetWindow, opts) {
    xde.sendTo(targetWindow, 'rendered', extend(opts || {}, {id: posId}));
}

function comClient (posId, targetWindow, origin) {
    if (typeof targetWindow !== 'object' || !window.postMessage) {
        throw new Error('targetWindow must be a Window object');
    }

    if (typeof origin !== 'string') {
        throw new Error('origin must be a string');
    }

    xde.targetOrigin = origin;
    return {
        rendered : rendered.bind(null, posId, targetWindow)
    };
}

comClient._setXde = function (_xde) {
    xde = _xde;
};


module.exports = comClient;
