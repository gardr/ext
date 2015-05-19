/* iframe actual src is only available inside iframe */
var REFRESH_STR = '&refresh=true';

module.exports = function(com, win) {
    com.on('refresh', function (payload) {
        var url = win.location.toString().replace(/#.*/, '');
        if (url.indexOf('?') === -1) {
            url += '?';
        }
        if (url.indexOf(REFRESH_STR) === -1) {
            url += REFRESH_STR;
        } else {
            url = url.replace(REFRESH_STR, '');
        }

        url += '#' + (payload.data && payload.data.hash || encodeURIComponent('{}'));

        win.location.replace(url);
    });
};
