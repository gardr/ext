/* jshint evil: true, expr: true */
/* global gardr:false */
var gardrExt = require('../lib/index.js');
var extend = require('util-extend');
var pluginCore = require('gardr-core-plugin');
var defaultParams = {
    id: 'pos-id',
    name: 'posname',
    minSize: 100,
    timeout: 200,
    url: 'http://gardr.github.io/foobar.js',
    height: 225,
    origin: 'http://github.com'
};

var extOpts = {
    allowedDomains: ['gardr.github.io', 'foobar.com']
};

function paramsStr (data) {
    return JSON.stringify(extend(extend({}, defaultParams), data));
}

function setUrlFragment (data) {
    document.location.hash = '#'+encodeURIComponent(paramsStr(data));
}

function setName (data) {
    window.name = paramsStr(data);
}

function triggerOnLoad () {
    var clock = sinon.useFakeTimers();
    var evt;
    try {
        evt = new UIEvent('load');
    } catch (e) {
        evt = document.createEvent('UIEvent');
        evt.initUIEvent('load', false, true, null);
    }
    window.dispatchEvent(evt);
    clock.tick(10);
    clock.restore();
}

describe('Garðr ext - gardrExt', function () {
    var orgWrite = document.write;
    var comClient;
    var com;
    var injected = [];

    beforeEach(function () {
        document.write = sinon.spy(function (str) {
            var tmp = document.createElement('span');
            tmp.innerHTML = str;
            injected.push(tmp.children[0]);
            document.body.appendChild(tmp.children[0]);
        });

        comClient = sinon.spy(function () {
            com = {rendered: sinon.spy()};
            return com;
        });
        gardrExt._setComClient(comClient);
        setUrlFragment();
    });

    afterEach(function () {
        delete window.gardr;
        document.write = orgWrite;
        window.name = null;
        injected.forEach(function (el) {
            el.parentElement && el.parentElement.removeChild(el);
        });
        document.location.hash = '#';
    });

    it('should throw an error if url is not on a valid domain', function () {
        expect(gardrExt.bind(null, {allowedDomains: ['example.com']})).to.throw();
    });

    it('should throw an error if url is a data-uri', function () {
        setUrlFragment({
            url: 'data:text/javascript;plain,void(0);'
        });
        expect(gardrExt).to.throw('protocol');
    });

    it('should not throw an error if a relative url', function () {
        setUrlFragment({
            url: '/foo/bar.js'
        });
        expect(gardrExt).not.to.throw();
    });

    it('should throw if one of the validDomains contains something else than just the hostname', function () {
        ['http://foobar.com', '//foobar.com', 'https://foobar.com', 'foobar.com/'].forEach(function (domain) {
            expect(gardrExt.bind(null, {allowedDomains: [domain]})).to.throw('Invalid domain');
        });
    });

    it('should not throw an error if url is on a valid domain', function () {
        setUrlFragment({
            url: 'http://foobar.com/foo/bar'
        });
        expect(gardrExt.bind(null, extOpts)).not.to.throw();
    });

    it('should define ‘gardr’ in global scope', function () {
        gardrExt(extOpts);

        expect(window.gardr).to.exist;
    });

    it('should read parameters from location.hash', function () {
        setUrlFragment({url: 'http://gardr.github.io/ad|123'});
        gardrExt(extOpts);

        expect(gardr.params).to.exist;
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.params.origin).to.equal('http://github.com');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal(200);
    });

    it('should read parameters from window.name', function () {
        document.location.hash = '#';
        setName({url: 'http://gardr.github.io/ad|123'});
        gardrExt(extOpts);

        expect(gardr.params).to.exist;
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.params.origin).to.equal('http://github.com');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal(200);
    });

    it('should log to div by default', function () {
        setUrlFragment({loglevel: 4});
        gardrExt(extOpts);
        gardr.log.debug('test');
        var logDiv = document.getElementById('logoutput');
        expect(logDiv).to.exist;
    });

    it('should document.write out a gardr container to the document', function () {
        gardrExt(extOpts);
        document.write.should.have.been.calledWithMatch(/<div id="gardr"><scr.pt src=".*"\s*><\/scr.pt><\/div>/);
    });

    it('should assign the gardr container to gardr.container', function () {
        gardrExt(extOpts);
        expect(gardr.container).to.exist;
        expect(gardr.container.id).to.equal('gardr');
    }),

    it('should set overflow:hidden on the gardr container', function () {
        gardrExt(extOpts);
        expect(gardr.container.style.overflow).to.equal('hidden');
    });

    it('should document.write a script tag with src equal to the input url', function() {
        var scriptUrl = 'http://gardr.github.io/script.js?q=1';
        setUrlFragment({url: scriptUrl});
        gardrExt(extOpts);

        document.write.should.have.been.calledWithMatch(function (value) {
            return value.indexOf('<script') >= 0 && value.indexOf(scriptUrl) >= 0;
        });
    });

    it('should trigger comClient.rendered when all resources are loaded', function () {
        gardrExt(extOpts);

        expect(comClient).to.have.been.calledOnce;
        expect(comClient).to.have.been.calledWith(gardr.id, window.parent, 'http://github.com');

        triggerOnLoad();

        expect(com.rendered).to.have.been.calledOnce;
    });

    it('should detect the size of the rendered banner', function () {
        gardrExt(extOpts);
        var el = document.getElementById('gardr');
        var span = document.createElement('span');
        span.innerHTML = '<span style="width:20px;height:10px;margin:0;padding:0;display:inline-block;">x</span>';
        el.appendChild(span);
        triggerOnLoad();
        expect(com.rendered).to.have.been.calledWithMatch(function (obj) {
            return typeof obj.width === 'number' && typeof obj.height === 'number';
        });
    });

    describe('plugins', function () {
        it('should allow to register plugins', function () {
            expect(function () {
                gardrExt.plugin(function () {});
            }).not.to.throw();
        });

        it('should initialize plugins', function () {
            var spy = sinon.spy();
            gardrExt.plugin(spy);
            gardrExt(extOpts);
            expect(spy).to.have.been.calledOnce;
            expect(spy.lastCall.args[0]).to.be.an.instanceof(pluginCore.PluginApi);
            expect(spy.lastCall.args[1]).to.have.keys( Object.keys(extOpts) );
        });

        it('should trigger params:parsed', function () {
            var spy = sinon.spy();
            gardrExt.plugin(function (api) {
                api.on('params:parsed', spy);
            });
            setUrlFragment({foo: 'bar'});
            gardrExt(extOpts);
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (data) {
                return data.foo === 'bar';
            });
        });

        it('should trigger element:containercreated', function () {
            var spy = sinon.spy();
            gardrExt.plugin(function (api) {
                api.on('element:containercreated', spy);
            });
            setUrlFragment({foo: 'bar'});
            gardrExt(extOpts);
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (el) {
                return el.id === 'gardr';
            });
        });

        it('should trigger banner:rendered', function () {
            var spy = sinon.spy();
            gardrExt.plugin(function (api) {
                api.on('banner:rendered', spy);
            });
            gardrExt(extOpts);
            triggerOnLoad();
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (data) {
                return data.width === 0 && data.height === 0;
            });
        });
    });
});
