var xde = require('cross-domain-events');

function rendered (targetWindow, opts) {
    xde.sendTo(targetWindow, 'rendered', opts);
}

function comClient (targetWindow, origin) {
    if (typeof targetWindow !== 'object' || !window.postMessage) {
        throw new Error('targetWindow must be a Window object');
    }

    if (typeof origin !== 'string') {
        throw new Error('origin must be a string');
    }

    xde.targetOrigin = origin;
    return {
        rendered : rendered.bind(null, targetWindow)
    };
}

comClient._setXde = function (_xde) {
    xde = _xde;
};


module.exports = comClient;