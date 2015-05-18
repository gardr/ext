/* jshint evil: true, expr: true */
/* global gardr:false */
var extend = require('util-extend');
var expect = require('expect.js');
var proxyquire = require('proxyquireify')(require);
var eventlistener = require('eventlistener');

var bannerAppender = require('../lib/log/appender/banner.js');

var triggerOnLoad;
var comClientSpy;
var gardrExt = proxyquire('../lib/index.js', {
    './log/getAppender.js': proxyquire('../lib/log/getAppender.js', {
        './appender/banner.js': bannerAppender
    }),
    './comClient.js': function com(a, b, c){
        return comClientSpy(a, b, c);
    },
    './timer.js': function(fn) {
        return fn();
    },
    eventlistener: {
        add: function fake(ctx, name, fn){
            if (name === 'load') {
                triggerOnLoad = fn;
            } else {
                return eventlistener.add(ctx, name, fn);
            }
        }
    }
});



function getDefaultParams() {
    return {
        logto: 'console',
        id: 'pos-id',
        name: 'posname',
        minSize: 100,
        timeout: 200,
        url: 'http://gardr.github.io/foobar.js?'+(+new Date()),
        height: 225,
        origin: 'http://github.com'
    };
}

var extOpts = {
    allowedDomains: ['gardr.github.io', 'foobar.com']
};

function createIframe() {
    var iframe = document.createElement('iframe');
    iframe.src          = 'about:blank';
    iframe.style.width  = '100px';
    iframe.style.height = '100px';
    iframe.style.overflow = 'hidden';
    document.body.appendChild(iframe);
    return iframe;
}


describe('Garðr ext - gardrExt', function () {
    var orgWrite = document.write;

    beforeEach(function () {

        this.iframe = createIframe();

        this.document = this.iframe.contentDocument;
        this.window = this.iframe.contentWindow;
        this.document.open();

        // head
        this.document.write(['<scr', 'ipt>', 'window.gardr = window.parent.gardr;', '</scr', 'ipt>'].join(''));
        // body
        this.document.write('<body><div id="gardr" style="overflow:hidden;">');

        // overwrrite iframe write
        var _write = this.document.write;
        this.document.write = sinon.spy(function (str){
            _write.call(this.document, str);
        }.bind(this));

        // overwrite parent write and pass on to iframe write
        document.write = sinon.spy(function (str) {
            this.document.write.call(this.document, str);
        }.bind(this));

        function paramsStr (data) {
            return JSON.stringify(extend(extend({}, getDefaultParams()), data));
        }

        this.setUrlFragment = function (data) {
            this.document.location.hash = '#' + encodeURIComponent(paramsStr(data));
        }.bind(this);

        this.setName = function (data) {
            this.window.name = paramsStr(data);
        };

        this.com = undefined;
        comClientSpy = this.comClientSpy = sinon.spy(function () {
            this.com = {rendered: sinon.spy()};
            return this.com;
        }.bind(this));

        gardrExt._mock(this.document, this.window);

        this.setUrlFragment();
    });

    afterEach(function () {
        this.iframe.contentDocument.close();

        document.body.removeChild(this.iframe);

        try {
            delete window.gardr;
        } catch(e){
            window.gardr = null;
        }
        document.write = orgWrite;
    });

    it('should throw an error if url is not on a valid domain', function () {
        expect(function(){
            gardrExt({allowedDomains: ['example.com']});
        }).to.throwError(/domain/);
    });

    it('should throw an error if url is a data-uri', function () {
        this.setUrlFragment({
            url: 'data:text/javascript;plain,void(0);'
        });
        expect(function(){
            gardrExt();
        }).to.throwError(/protocol/);
    });

    it('should not throw an error if a relative url', function () {
        this.setUrlFragment({
            url: '/foo/bar.js'
        });

        expect(function(){
            gardrExt().inject();
        }).not.to.throwError();
    });

    it('should throw if one of the validDomains contains something else than just the hostname', function () {
        ['http://foobar.com', '//foobar.com', 'https://foobar.com', 'foobar.com/'].forEach(function (domain) {
            expect(function(){
                gardrExt({allowedDomains: [domain]}).inject();
            }).to.throwError(/Invalid domain/);
        });
    });

    it('should not throw an error if url is on a valid domain', function () {
        this.setUrlFragment({
            url: 'http://foobar.com/foo/bar'
        });
        expect(function(){
            gardrExt(extOpts).inject();
        }).not.to.throwError();
    });

    it('should define ‘gardr’ in global scope', function () {
        gardrExt(extOpts);

        expect(window.gardr).to.be.ok();
    });

    it('should read parameters from location.hash', function () {
        this.timeout(5000); // ie8
        this.setUrlFragment({url: 'http://gardr.github.io/ad|123'});
        gardrExt(extOpts);

        expect(gardr.params).to.be.ok();
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.params.origin).to.equal('http://github.com');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal(200);
    });

    it('should read parameters from window.name', function () {
        this.document.location.hash = '';
        this.setName({url: 'http://gardr.github.io/ad|123'});
        gardrExt(extOpts);

        expect(gardr.params).to.be.ok();
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.params.origin).to.equal('http://github.com');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal(200);
    });

    it('should log to div by default', function () {

        var restore = bannerAppender._setTimeoutFn(function triggerTimeoutSync2(fn){
            fn();
        });

        this.setUrlFragment({
            loglevel: 5, logto: 'banner'
        });

        gardrExt(extOpts).inject();

        var logDiv = document.getElementById('logoutput');

        expect(logDiv).to.not.be(null);
        expect(logDiv.children.length).to.equal(1);

        gardr.log.debug('test-with-log-level-4');

        expect(logDiv.children.length).to.equal(2);

        restore();
    });

    it('should document.write out a gardr container to the document', function () {
        gardrExt(extOpts).inject();
        var assertion = this.document.write.calledWithMatch(/^<scr.pt\s*id=".*"\s*src=".*"\s*><\/scr.pt>$/);
        expect(assertion).to.be.ok();
    });

    it('should assign the gardr container to gardr.container', function () {
        gardrExt(extOpts).inject();
        expect(gardr.container).to.be.ok();
        expect(gardr.container.id).to.equal('gardr');
    }),

    it('should set overflow:hidden on the gardr container', function () {
        gardrExt(extOpts).inject();
        expect(gardr.container.style.overflow).to.equal('hidden');
    });

    it('should document.write a script tag with src equal to the input url', function() {
        var scriptUrl = 'http://gardr.github.io/script.js?q=1';
        this.setUrlFragment({url: scriptUrl});
        gardrExt(extOpts).inject();

        var assertion = this.document.write.calledWithMatch(function (value) {
            return value.indexOf('<script') >= 0 && value.indexOf(scriptUrl) >= 0;
        });
        expect(assertion).to.be.ok();
    });

    it('should trigger comClientSpy.rendered when all resources are loaded', function () {
        gardrExt(extOpts);

        expect(this.comClientSpy.calledOnce).to.be.ok();
        expect(this.comClientSpy.calledWith(gardr.id, this.window.parent, 'http://github.com')).to.be.ok();

        triggerOnLoad();

        expect(this.com.rendered.calledOnce).to.be.ok();
    });

    it('should detect the size of the rendered banner', function () {
        gardrExt(extOpts).inject();

        var el = this.document.getElementById('gardr');
        var span = this.document.createElement('span');
        span.innerHTML = '<span style="width:20px;height:10px;margin:0;padding:0;display:inline-block;">x</span>';
        el.appendChild(span);

        triggerOnLoad();

        var assertion = this.com.rendered.calledWithMatch(function (obj) {
            return typeof obj.width === 'number' && typeof obj.height === 'number';
        });
        expect(this.com.rendered.calledOnce).to.be.ok();
        expect(assertion).to.be.ok();
    });

    describe('plugins', function () {

        it('should allow to register plugins', function () {
            expect(function () {
                gardrExt.plugin(function () {});
            }).not.to.throwError();
        });

        it('should initialize plugins', function () {
            var spy = sinon.spy();

            gardrExt.plugin(spy);

            gardrExt(extOpts);

            expect(spy.calledOnce).to.be.ok();
            expect(spy.lastCall.args[1]).to.have.keys( Object.keys(extOpts) );
            // expect(spy.lastCall.args[0].id).to.be(0);
        });

        it('should trigger params:parsed', function () {
            var spy = sinon.spy();
            gardrExt.plugin(function (api) {
                api.on('params:parsed', spy);
            });
            this.setUrlFragment({foo: 'bar'});
            gardrExt(extOpts);

            expect(spy.calledOnce).to.be.ok();
            expect(spy.calledWithMatch(function (data) {
                return data.foo === 'bar';
            })).to.be.ok();
        });

        it('should trigger element:containercreated', function () {
            var spy = sinon.spy();
            gardrExt.plugin(function (api) {
                api.on('element:containercreated', spy);
            });
            this.setUrlFragment({foo: 'bar'});
            gardrExt(extOpts).inject();
            expect(spy.calledOnce).to.be.ok();
            expect(spy.calledWithMatch(function (el) {
                return el.id === 'gardr';
            })).to.be.ok();
        });

        it('should trigger banner:rendered', function () {
            var spy = sinon.spy();
            gardrExt.plugin(function (api) {
                api.on('banner:rendered', spy);
            });
            gardrExt(extOpts).inject();
            triggerOnLoad();
            expect(spy.calledOnce).to.be.ok();
            expect(spy.calledWithMatch(function (data) {
                return data.width === 0 && data.height === 0;
            })).to.be.ok();
        });
    });
});
