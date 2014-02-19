/* jshint evil: true, expr: true */
/* global gardr:false */
var bootStrap = require('../src/index.js');
var hashTemplate = '#GARDR_|_pos-id_|_key=MANAGER&origin=http%3A%2F%2Fgardr.github.io_|_name=posname&minSize=100&timeo\
ut=200&url={url}&height=225';
var exampleHash = hashTemplate.replace('{url}', 'data:text/javascript;plain,void(0);');

function makeHash (data) {
    data = data || {};
    return Object.keys(data).reduce(function (hash, key) {
        return hash.replace('{' + key + '}', encodeURIComponent(data[key]));
    }, hashTemplate);
}

function triggerOnLoad () {
    var evt;
    try {
        evt = new UIEvent('load');
    } catch (e) {
        evt = document.createEvent('UIEvent');
        evt.initUIEvent('load', false, true, null);
    }
    window.dispatchEvent(evt);
}

describe('Garðr ext - bootStrap', function () {
    var orgWrite = document.write;
    var comClient;
    var com;

    beforeEach(function () {
        document.write = sinon.spy();

        comClient = sinon.spy(function () {
            com = {rendered: sinon.spy()};
            return com;
        });
        bootStrap._setComClient(comClient);
    });

    afterEach(function () {
        delete window.gardr;
        document.write = orgWrite;
    });

    it('should define ‘gardr’ in global scope', function () {
        bootStrap(exampleHash);

        expect(window.gardr).to.exist;
    });

    it('should read parameters from location.href by default', function () {
        bootStrap(makeHash({url: 'http://gardr.github.io/ad|123'}));

        expect(gardr.params).to.exist;
        expect(gardr.id).to.equal('pos-id');
        expect(gardr.internal.origin).to.equal('http://gardr.github.io');
        expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
        expect(gardr.params.timeout).to.equal('200');
    });

    it('should log to div by default', function () {
        bootStrap(exampleHash + '&loglevel=4');
        gardr.log.debug('test');
        var logDiv = document.getElementById('logoutput');
        expect(logDiv).to.exist;
    });

    it('should document.write a script tag with src equal to the input url', function() {
        var scriptUrl = 'http://external.com/script.js?q=1';
        bootStrap(makeHash({url: scriptUrl}));

        document.write.calledWithMatch(function (value) {
            return value.indexOf('<script') >= 0 && value.indexOf(scriptUrl) >= 0;
        });
    });

    it('should trigger comClient.rendered when all resources are loaded', function () {
        bootStrap(exampleHash);

        expect(comClient).to.have.been.calledOnce;
        expect(comClient).to.have.been.calledWith(window.top, 'http://gardr.github.io');

        triggerOnLoad();

        expect(com.rendered).to.have.been.calledOnce;
    });
});
