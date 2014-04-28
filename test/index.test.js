/* jshint evil: true, expr: true */
/* global gardr:false */
var bootStrap = require('../lib/index.js');
var extend = require('util-extend');
var pluginCore = require('gardr-core-plugin');
var defaultParams = {
    id: 'pos-id',
    name: 'posname',
    minSize: 100,
    timeout: 200,
    url: 'data:text/javascript;plain,void(0);',
    height: 225,
    origin: 'http://gardr.github.io'
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

describe('Garðr ext - bootStrap', function () {
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
        bootStrap._setComClient(comClient);
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

    it('should define ‘gardr’ in global scope', function () {
        bootStrap();

        expect(window.gardr).to.exist;
    });

    it('should read parameters from location.hash', function () {
        setUrlFragment({url: 'http://gardr.github.io/ad|123'});
        bootStrap();

        expect(gardr.params).to.exist;
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.params.origin).to.equal('http://gardr.github.io');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal(200);
    });

    it('should read parameters from window.name', function () {
        document.location.hash = '#';
        setName({url: 'http://gardr.github.io/ad|123'});
        bootStrap();

        expect(gardr.params).to.exist;
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.params.origin).to.equal('http://gardr.github.io');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal(200);
    });

    it('should log to div by default', function () {
        setUrlFragment({loglevel: 4});
        bootStrap();
        gardr.log.debug('test');
        var logDiv = document.getElementById('logoutput');
        expect(logDiv).to.exist;
    });

    it('should document.write out a gardr container to the document', function () {
        bootStrap();
        document.write.should.have.been.calledWithMatch(/<span id="gardr"><scr.pt src=".*"\s*><\/scr.pt><\/span>/);
    });

    it('should document.write a script tag with src equal to the input url', function() {
        var scriptUrl = 'http://external.com/script.js?q=1';
        setUrlFragment({url: scriptUrl});
        bootStrap();

        document.write.should.have.been.calledWithMatch(function (value) {
            return value.indexOf('<script') >= 0 && value.indexOf(scriptUrl) >= 0;
        });
    });

    it('should trigger comClient.rendered when all resources are loaded', function () {
        bootStrap();

        expect(comClient).to.have.been.calledOnce;
        expect(comClient).to.have.been.calledWith(gardr.id, window.parent, 'http://gardr.github.io');

        triggerOnLoad();

        expect(com.rendered).to.have.been.calledOnce;
    });

    it('should detect the size of the rendered banner', function () {
        bootStrap();
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
                bootStrap.plugin(function () {});
            }).not.to.throw();
        });

        it('should initialize plugins', function () {
            var spy = sinon.spy();
            bootStrap.plugin(spy);
            bootStrap();
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (api) {
                return api instanceof pluginCore.PluginApi;
            });
        });

        it('should trigger params:parsed', function () {
            var spy = sinon.spy();
            bootStrap.plugin(function (api) {
                api.on('params:parsed', spy);
            });
            setUrlFragment({foo: 'bar'});
            bootStrap();
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (data) {
                return data.foo === 'bar';
            });
        });

        it('should trigger element:containercreated', function () {
            var spy = sinon.spy();
            bootStrap.plugin(function (api) {
                api.on('element:containercreated', spy);
            });
            setUrlFragment({foo: 'bar'});
            bootStrap();
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (el) {
                return el.id === 'gardr';
            });
        });

        it('should trigger banner:rendered', function () {
            var spy = sinon.spy();
            bootStrap.plugin(function (api) {
                api.on('banner:rendered', spy);
            });
            bootStrap();
            triggerOnLoad();
            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithMatch(function (data) {
                return data.width === 0 && data.height === 0;
            });
        });
    });
});
