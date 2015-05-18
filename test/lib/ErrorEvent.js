module.exports = function (type, extra, name) {
    name = name || 'CustomEvent';
    var event = document.createEvent(name);
    event.initEvent(type, false, true);
    for (var key in (extra || {})) {
        event[key] = extra[key];
    }
    return event;
};
