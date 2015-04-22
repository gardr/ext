module.exports = function(config) {
    var settings = {
        basePath: '',
        frameworks: ['mocha', 'es5-shim', 'browserify', 'sinon'],

        files: [
            'node_modules/ie8/build/ie8.max.js',
            'test/lib/Function-polyfill.js'
            'test/**/*.js'
        ],

        reporters: ['progress'],

        preprocessors: {
            'test/**/*.js': 'browserify'
        },

        browserify: {
            watch: true,
            debug: true
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        captureTimeout: 60000,
        singleRun: false
    };

    if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
        settings.browserDisconnectTimeout = 60000;
        settings.browserNoActivityTimeout = 60000;
        settings.captureTimeout = 60000 * 3;
        settings.autoWatch = false;
        settings.sauceLabs = {
            testName: 'Gardr ext',
            tags: ['gardr', 'ext']
        };
        settings.reporters = ['dots', 'saucelabs'];
        settings.customLaunchers = {};

        // only 3 vmms / browsers per run because of
        var key = process.env.BROWSER_TYPE;
        var target = require('./ci-browsers.js')[key];
        if (!target) {
            console.error('Missing / Unknown BROWSER_TYPE ' + process.env.BROWSER_TYPE);
            process.exit(1);
        }

        Object.keys(target).forEach(function(key){
            settings.customLaunchers[key] = target[key];
        });

        console.log('Running CI tests on', Object.keys(settings.customLaunchers).join(', '));
        settings.browsers = Object.keys(settings.customLaunchers);
    }


    config.set(settings);
};
