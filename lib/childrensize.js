'use strict';

var computedStyle = require('computed-style');

var CLIPPING_OVERFLOW_VALUES = ['scroll', 'hidden', 'auto', 'overlay'];
var FILTER_POSITION_VALUES = ['absolute', 'fixed'];

var rectStore = null;

function toArray (nodeList) {
    // Array.prototype.slice does not work on HTMLCollection in IE8
    var arr = [];
    if (nodeList) {
        var node;
        for (var i=0, l=nodeList.length; i<l; i++) {
            node = nodeList[i];
            // Filter out anything but elements
            if (node.nodeType === 1) {
                arr.push(node);
            }
        }
    }
    return arr;
}

function filterChildren (nodeList) {

    return toArray(nodeList).filter(function (child) {
        var position = computedStyle(child, 'position');
        child._rect = child.getBoundingClientRect(); // store rect for later

        return (
            FILTER_POSITION_VALUES.indexOf(position) === -1 &&
            !(child._rect.width === 0 && child._rect.height === 0)
        );
    });

}

var storeNodeRect = function (element) {

    var children = filterChildren(element.childnodes);
    var overflow = computedStyle(element, 'overflow');

    if (rectStore === null) {
        rectStore = {
            top: element._rect.top,
            right: element._rect.right,
            bottom: element._rect.bottom,
            left: element._rect.left
        };
    }

    rectStore.top       = Math.min(rectStore.top, element._rect.top);
    rectStore.right     = Math.max(rectStore.right, element._rect.right);
    rectStore.bottom    = Math.max(rectStore.bottom, element._rect.bottom);
    rectStore.left      = Math.min(rectStore.left, element._rect.left);

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
