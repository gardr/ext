var inside = require('../src/inside.js');

var example_hash = '#GARDR_|_pos-id_|_key=MANAGER&origin=http%3A%2F%2Fgardr.github.io_|_name=posname&minSize=100&timeout=200&url=http%3A%2F%2Fgardr.github.io%2Fad%7C123&height=225';

describe('inside', function () {
	beforeEach(function () {
		location.hash = example_hash;
	});

	afterEach(function () {
		delete window.gardr;
	});

	it('should define ‘gardr’ in global scope', function () {
		inside();

		expect(window.gardr).to.exist;
	});

	it('should read parameters from location.href by default', function () {
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
});