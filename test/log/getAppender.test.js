var consoleAppender = require('../../lib/log/appender/console.js');
var bannerAppender = require('../../lib/log/appender/banner.js');
var getAppender = require('../../lib/log/getAppender.js');

var expect = require('expect.js');

describe('getAppender', function() {
    it('should default to bannerAppender', function() {
        expect(getAppender()).to.equal(bannerAppender);
    });

    it('should return consoleAppender for logTo \'console\'', function() {
        expect(getAppender('console')).to.equal(consoleAppender);
    });
});
