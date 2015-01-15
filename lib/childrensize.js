'use strict';

var computedStyle = require('computed-style');

var CLIPPING_OVERFLOW_VALUES = ['scroll', 'hidden', 'auto', 'overlay'];
var FILTER_POSITION_VALUES = ['absolute', 'fixed'];

var rectStore = null;

function toArray (nodeList) {
    // Array.prototype.slice does not work on HTMLCollection in IE8
    var arr = [];
    for (var i=0, l=nodeList.length; i<l; i++) { arr.push(nodeList[i]); }
    return arr;
}

function filterChildren (children) {

    return toArray(children).filter(function (child) {
        var position = computedStyle(child, 'position');
        child._rect = child.getBoundingClientRect(); // store rect for later

        return (
            FILTER_POSITION_VALUES.indexOf(position) === -1 &&
            !(child._rect.width === 0 && child._rect.height === 0)
        );
    });

}

var storeNodeRect = function (node) {

    var children = filterChildren(node.children);
    var overflow = computedStyle(node, 'overflow');

    if (rectStore === null) {
        rectStore = {
            top: node._rect.top,
            right: node._rect.right,
            bottom: node._rect.bottom,
            left: node._rect.left
        };
    }

    rectStore.top       = Math.min(rectStore.top, node._rect.top);
    rectStore.right     = Math.max(rectStore.right, node._rect.right);
    rectStore.bottom    = Math.max(rectStore.bottom, node._rect.bottom);
    rectStore.left      = Math.min(rectStore.left, node._rect.left);

    if (CLIPPING_OVERFLOW_VALUES.indexOf(overflow) === -1) {
        children.forEach(function (el) {
            storeNodeRect(el);
        });
    }

};

function run (baseNode) {

    if (!baseNode) {
        return;
    }

    // reset
    rectStore = null;

    filterChildren(baseNode.children).forEach(function (el) {
        storeNodeRect(el);
    });

    return {
        width: rectStore ? rectStore.right - rectStore.left : 0,
        height: rectStore ? rectStore.bottom - rectStore.top : 0
    };
}

module.exports = run;
