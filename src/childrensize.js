var computedStyle = require('computed-style');

module.exports = function(container) {
    if (!container) { return; }

    var children = [].slice.call(container.children, 0).filter(function (el) {
        var pos = computedStyle(el, 'position');
        el.rect = el.getBoundingClientRect(); // store rect for later
        return !(
           (pos === 'absolute' || pos === 'fixed') ||
           (el.rect.width === 0 && el.rect.height === 0)
        );
    });
    if (children.length === 0) {
        return { width: 0, height: 0 };
    }

    var totRect = children.reduce(function (tot, el) {
        return (!tot ?
            el.rect :
            {
                top    : Math.min(tot.top, el.rect.top),
                left   : Math.min(tot.left, el.rect.left),
                right  : Math.max(tot.right, el.rect.right),
                bottom : Math.max(tot.bottom, el.rect.bottom)
            });
    }, null);

    return {
        width: totRect.right - totRect.left,
        height: totRect.bottom - totRect.top
    };
};
