'use strict';

var computedStyle = require('computed-style');

var CLIPPING_OVERFLOW_VALUES = ['scroll', 'hidden', 'auto', 'overlay'];
function isNotOverflowing(element) {
    var of = computedStyle(element, 'overflow');

    if (of === '') {
        // we only need to check either X or Y because
        // if either isnt visible, they will both be a hidden value.
        of = computedStyle(element, 'overflow-x');
    }
    return CLIPPING_OVERFLOW_VALUES.indexOf(of) === -1;
}
var FILTER_POSITION_VALUES = ['absolute', 'fixed'];
function isStaticPosition(position) {
    return FILTER_POSITION_VALUES.indexOf(position) === -1;
}

function toArray (nodeList) {
    // Array.prototype.slice does not work on HTMLCollection in IE8
    var arr = [];
    for (var i=0, l=nodeList.length; i<l; i++) { arr.push(nodeList[i]); }
    return arr;
}

function filterChildren (nodeList) {
    return toArray(nodeList).filter(function (node) {
        // Ignore everything but element nodes
        if (node.nodeType !== 1) {
            return false;
        }
        return isStaticPosition(computedStyle(node, 'position'));
    });
}

var rectStore = null;
var storeNodeRect = function (element) {

    var children = filterChildren(element.childNodes);

    var rect = element.getBoundingClientRect();

    if (rectStore === null) {
        rectStore = {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left
        };
    }

    // TODO, need more work: what about other "inline"-like display values?

    // if no element children, lets use this element size
    if (children.length === 0 || computedStyle(element, 'display') !== 'inline') {
        rectStore.top       = Math.min(rectStore.top, rect.top);
        rectStore.bottom    = Math.max(rectStore.bottom, rect.bottom);
    }

    rectStore.right     = Math.max(rectStore.right, rect.right);
    rectStore.left      = Math.min(rectStore.left, rect.left);

    if (isNotOverflowing(element)) {
        children.forEach(function (el) {
            storeNodeRect(el);
        });
    }
};

module.exports = function getChildrenSize(baseNode) {

    if (!baseNode) {
        return;
    }

    // reset
    rectStore = null;

    filterChildren(baseNode.childNodes).forEach(function (el) {
        storeNodeRect(el);
    });

    return {
        width: rectStore ? rectStore.right - rectStore.left : 0,
        height: rectStore ? rectStore.bottom - rectStore.top : 0
    };
};
