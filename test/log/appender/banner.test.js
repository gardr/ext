/*jshint expr: true*/
var logToBanner = require('../../../lib/log/appender/banner.js');
var expect = require('expect.js');

describe('logToBanner', function() {
    var logObj = {
        msg: 'test log',
        time: new Date().getTime(),
        level: 4,
        name: 'testName'
    };

    afterEach(function(){
        logToBanner.reset();
    });

    it('should render an overlay the first time it\'s called', function() {
        logToBanner(logObj);
        var output = document.getElementById('logoutput');
        expect(output).to.be.ok();
    });

    it('should output a div for each log message', function(done) {
        logToBanner(logObj);

        setTimeout(function(){
            var output = document.getElementById('logoutput');
            expect(output.children.length).to.equal(1);
            expect(output.children[0].textContent).to.have.string(logObj.msg);
            done();
        }, 51);
    });

    it('should include script url and line for script errors', function(done) {
        var errObj = {
            msg: 'Uncaught SyntaxError: Test',
            time: new Date().getTime(),
            level: 1,
            url: 'http://gardrtest.com/scripterror.js',
            line: 123,
            stack: []
        };
        logToBanner(errObj);

        setTimeout(function(){
            var output = document.getElementById('logoutput');
            expect(output.children.length).to.equal(1);
            expect(output.children[0].textContent).to.have.string(errObj.url + ':' + errObj.line);
            done();
        }, 51);

    });
});
