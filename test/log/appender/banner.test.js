/*jshint expr: true*/
var logToBanner = require('../../../lib/log/appender/banner.js');
var expect = require('expect.js');

describe('banner log appender', function() {
    function getLogObj() {
        var time = +new Date();
        return {
            logto: 'banner',
            msg: 'test log ' + time,
            time: time,
            level: 4,
            name: 'testName' + time
        };
    }

    beforeEach(function() {
        this.restoreTimer = logToBanner._setTimeoutFn(function triggerTimeoutSync(fn){
            return fn();
        });
    });

    afterEach(function(){
        this.restoreTimer();
        logToBanner.reset();
    });

    it('should render an overlay the first time it\'s called', function() {
        var logObj = getLogObj();
        logToBanner(logObj);

        var output = document.getElementById('logoutput');
        expect(output).to.be.ok();

    });

    it('should output a div for each log message', function() {
        logToBanner.reset();
        var logObj = getLogObj();
        logToBanner(logObj);

        var output = document.getElementById('logoutput');

        expect(output.children.length).to.equal(1);
        expect(output.children[0].textContent||output.children[0].innerText).to.have.string(logObj.msg);
    });

    it('should include script url and line for script errors', function() {
        logToBanner.reset();
        var errObj = {
            msg: 'Uncaught SyntaxError: Test',
            time: new Date().getTime(),
            level: 1,
            url: 'http://gardrtest.com/scripterror.js',
            line: 123,
            stack: []
        };
        logToBanner(errObj);
        var output = document.getElementById('logoutput');

        expect(output.children.length).to.equal(1);
        var textEntry = output.children[0].textContent||output.children[0].innerText;
        expect(textEntry).to.have.string(errObj.url + ':' + errObj.line);

    });
});
