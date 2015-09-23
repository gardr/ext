#!/usr/bin/env node
require('shelljs/make');
var path = require('path');

var jshint = makeCmd('./node_modules/.bin/jshint');
var karma = makeCmd('./node_modules/karma/bin/karma');

function makeCmd (unixPath) {
    var path = platformPath(unixPath);
    return function () {
        exec([path].concat([].slice.call(arguments, 0)).join(' '));
    };
}

// Replace / with \ on windows
function platformPath(p) {
    return p.split('/').join(path.sep);
}

function setupPhantomPath() {
    if (!env['PHANTOMJS_BIN']) {
        try {
            var path  = require('phantomjs2').path;
            if (path) {
                env['PHANTOMJS_BIN'] = path;
            }
            if (!path) {
                path  = require('phantomjs').path;
                if (path) {
                    env['PHANTOMJS_BIN'] = path;
                }
            }
        } catch(e){}
    }
}

target.lint = function () {
    jshint(
        '--reporter node_modules/jshint-stylish/stylish.js',
        'lib',
        'test',
        '--exclude test/lib'
    );
};

target.test = function () {
    target.lint();
    setupPhantomPath();
    karma('start', '--single-run');
};

target.ci = function () {
    target.lint();
    setupPhantomPath();
    ['ie', 'ienew', 'chrome', 'android', 'ios', 'firefox'].forEach(function(browserType){
        env['BROWSER_TYPE'] = browserType;
        karma('start', '--single-run');
    });
};

target.watch = function () {
    target.lint();
    setupPhantomPath();
    karma('start');
};
