var inside = require('../src/inside.js');

var hash_template = '#GARDR_|_pos-id_|_key=MANAGER&origin=http%3A%2F%2Fgardr.github.io_|_name=posname&minSize=100&timeout=200&url={url}&height=225';
var example_hash = hash_template.replace('{url}', 'data:text/javascript;plain,void(0);');

function makeHash (data) {
	return Object.keys(data).reduce(function (hash, key) {
		return hash.replace('{' + key + '}', encodeURIComponent(data[key]));
	}, hash_template);
}

describe('inside', function () {
	var orgWrite = document.write;

	beforeEach(function () {
		location.hash = example_hash;
		document.write = sinon.spy();
	});

	afterEach(function () {
		delete window.gardr;
		document.write = orgWrite;
	});

	it('should define ‘gardr’ in global scope', function () {
		inside();

		expect(window.gardr).to.exist;
	});

	it('should read parameters from location.href by default', function () {
		location.hash = makeHash({url: 'http://gardr.github.io/ad|123'});
		inside();

		expect(gardr.params).to.exist;
		expect(gardr.id).to.equal('pos-id');
		expect(gardr.internal.origin).to.equal('http://gardr.github.io');
		expect(gardr.params.url).to.equal('http://gardr.github.io/ad|123');
		expect(gardr.params.timeout).to.equal('200');
	});

	it('should log to div by default', function () {
		location.hash += '&loglevel=4';
		inside();
		gardr.log.debug('test');
		var logDiv = document.getElementById('logoutput');
		expect(logDiv).to.exist;
	});

	it('should document.write a script tag with src equal to the input url', function() {
		var scriptUrl = 'http://external.com/script.js?q=1';
		location.hash = makeHash({url: scriptUrl});
		
		inside();

		document.write.calledWithMatch(function (value) {
			return value.indexOf('<script') >= 0 && value.indexOf(scriptUrl) >= 0;
		});
	});
});