module.exports = function timeoutWrap(fn, time) {
    return window.setTimeout(fn, time);
};
