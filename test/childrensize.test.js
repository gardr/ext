/* jshint expr: true */
var childrenSize = require('../lib/childrensize.js');
var insertCss    = require('../lib/style/insertCss.js');

function createElement (tag, width, height) {
    var div = document.createElement(tag);
    if (width) { div.style.width = width; }
    if (height) { div.style.height = height; }
    div.style.padding = 0;
    div.style.margin = 0;
    return div;
}
var createDiv = createElement.bind(null, 'div');

describe('childrenSize', function () {
    it('should return undefined when calling without a dom element', function () {
        var res = childrenSize();
        expect(res).to.be.undefined;
    });

    it('should return width and height 0 for an element without children', function () {
        var div = document.body.appendChild(createDiv('10px', '10px'));
        var res = childrenSize(div);
        expect(res).to.exist;
        expect(res.width).to.equal(0);
        expect(res.height).to.equal(0);
    });

    it('should return calculated width and height for an element with one child', function () {
        var parent = createDiv('100%');
        parent.appendChild(createDiv('10px', '10px'));
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10);
        expect(res.height).to.equal(10);
    });

    it('should return total with and height for multiple children', function () {
        var parent = createDiv('100%');
        parent.appendChild(createElement('span', '10px', '10px')).style.display = 'inline-block';
        parent.appendChild(createElement('span', '10px', '10px')).style.display = 'inline-block';
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(20, 'width');
        expect(res.height).to.equal(10, 'height');
    });

    it('should ignore children with position absolute/fixed', function () {
        insertCss('#absolute-position { position: absolute; display: inline-block; }');
        insertCss('#fixed-position { position: fixed; display: inline-block; }');
        var parent = createDiv('100%');
        parent.appendChild(createDiv('10px', '10px')).id = 'absolute-position';
        parent.appendChild(createDiv('10px', '10px')).id = 'fixed-position';
        parent.appendChild(createElement('span', '10px', '10px')).style.display = 'inline-block';
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

});
