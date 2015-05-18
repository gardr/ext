/* jshint expr: true */
var comClient   = require('../lib/comClient.js');
var expect = require('expect.js');

describe('comClient', function () {
    var id = 'pos_id';
    var win = window.top;
    var origin = 'http://www.someorigin.com';

    beforeEach(function() {
        this.xde = { sendTo : sinon.spy() };
        comClient._setXde(this.xde);
    });

    it('should throw if comClient is called with wrong parameters', function () {
        expect(comClient).to.throwError();
        expect(function () {
            comClient(id, 'http://www.someOrigin.com', win);
        }).to.throwError();
    });

    it('should return a handler if called with proper parameters', function() {
        var com = comClient(id, win, origin);
        expect(com).to.be.ok();
    });

    describe('rendered', function () {
        it('should call xde.sendTo once', function() {
            var com = comClient(id, win, origin);
            com.rendered();
            expect(this.xde.sendTo.calledOnce).to.be.ok();
        });

        it('should call xde.sendTo with window, origin and ‘rendered’ as arguments', function() {
            var com = comClient(id, win, origin);
            com.rendered();
            var args = this.xde.sendTo.getCall(0).args;
            expect(args[0]).to.be(win);
            expect(args[1]).to.be('rendered');
            expect(args[2].id).to.be(id);
            expect(this.xde.targetOrigin).to.equal(origin);
        });

        it('should call xde.sendTo with the opts object', function() {
            var com = comClient(id, win, origin);
            com.rendered({
                width: 20,
                height: 10
            });

            var args = this.xde.sendTo.getCall(0).args;
            expect(args[0]).to.be(win);
            expect(args[1]).to.be('rendered');
            expect(args[2].id).to.be(id);
            expect(args[2].width).to.be(20);
            expect(args[2].height).to.be(10);
        });
    });
});
