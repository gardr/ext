/* jshint expr: true */
var childrenSize = require('../lib/childrensize.js');
var insertCss    = require('../lib/style/insertCss.js');
var expect = require('expect.js');

function createElement (tagName, width, height) {
    var el = document.createElement(tagName);

    if (tagName === 'a') {
        el.style.display = 'block';
    }

    if (tagName === 'img') {
        // firefox does not let you style img tags without a src
        /* jshint ignore:start */
        el.src = 'data:image/png;base64,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';
        /* jshint ignore:end */
    }

    if (width) {
        el.style.width = width;
    }

    if (height) {
        el.style.height = height;
    }
    el.style.padding = 0;
    el.style.margin = 0;
    return el;
}

var createDiv = createElement.bind(null, 'div');

function instanceOfHTMLCollection (obj) {
    return obj instanceof HTMLCollection;
}

describe('childrenSize', function () {
    it('should not use Array slice', function () {
        var sliceSpy = sinon.spy(Array.prototype, 'slice');
        childrenSize( document.body.appendChild( createDiv('100%', '10px') ) );
        expect(sliceSpy.called).to.not.be.ok();
        var match = sliceSpy.calledOn( sinon.match(instanceOfHTMLCollection) );
        expect(match).to.not.be.ok();
    });

    it('should return undefined when calling without a dom element', function () {
        var res = childrenSize();
        expect(res).to.be(undefined);
    });

    it('should return width and height 0 for an element without children', function () {
        var div = document.body.appendChild(createDiv('10px', '10px'));
        var res = childrenSize(div);
        expect(res).to.be.ok();
        expect(res.width).to.equal(0);
        expect(res.height).to.equal(0);
    });

    it('should return calculated width and height for an element with one child', function () {
        var parent = createDiv('100%');
        parent.appendChild(createDiv('10px', '10px'));
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(10);
        expect(res.height).to.equal(10);
    });

    it('should ignore all but element nodes when calculating width and height', function () {
        var parent = createDiv('100%');
        parent.appendChild(createDiv('10px', '10px'));
        var element = (createElement('span', '15px', '5px'));
        element.style.display = 'inline-block';
        element.innerHTML = 'count me, and I will make you fail';
        parent.appendChild(element);
        document.body.appendChild(parent);

        parent.style.lineHeight = '0px';
        parent.style.fontSize = '0px';

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(15);
        expect(res.height).to.equal(15);
    });


    it('should return total with and height for multiple same-level children', function () {
        var parent = createDiv('100%');
        var elm = parent.appendChild(createElement('span', '10px', '10px'));
        elm.style.display = 'inline-block';
        elm.innerHTML = '&nbsp;';
        parent.appendChild(createElement('span', '15px', '5px')).style.display = 'inline-block';
        parent.appendChild(createElement('div', '30px', '10px'));
        parent.appendChild(createElement('strong', '5px', '15px')).style.display = 'inline-block';
        document.body.appendChild(parent);

        parent.style.lineHeight = '0px';
        parent.style.fontSize = '0px';

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(30, 'width');
        expect(res.height).to.equal(40, 'height');
    });

    it('should return total with and height for nested children', function () {
        var parent = createDiv('100%');
        var section = createElement('section', '40px', '40px');
        var header = createElement('header', '40px', '40px');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        img.style.verticalAlign = 'bottom';
        section.appendChild(header);
        header.appendChild(a);
        a.appendChild(img);
        parent.appendChild(section);
        document.body.appendChild(parent);

        var res = childrenSize(parent);

        expect(res).to.be.ok();
        expect(res.width).to.equal(40, 'width');
        expect(res.height).to.equal(50, 'height');
    });

    it('should return total with and height for multiple nested children', function () {
        var parent = createDiv('100%');
        var aside = createElement('aside', '200px', '400px');
        var section1 = createElement('section', '200px', '200px');
        var section2 = createElement('section', '200px', '200px');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '300px', '100px');
        var span = createElement('span');

        img.style.verticalAlign = 'bottom';
        aside.appendChild(section1);
        section1.appendChild(a);
        a.appendChild(img);
        aside.appendChild(section2);
        section2.appendChild(span);
        parent.appendChild(aside);

        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(300, 'width');
        expect(res.height).to.equal(400, 'height');
    });

    it('should take overflow:hidden into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '100px', '100px');
        var img = createElement('img', '300px', '500px');

        a.style.display = 'block';
        a.style.overflow = 'hidden';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(100, 'width');
        expect(res.height).to.equal(100, 'height');
    });

    it('should take overflow:scroll into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        // be aware that IE adds scrollbars to size if element is to small,
        // so e.g. a size 10 instead of 100 here wont fly.
        var el = createElement('a', '100px', '100px');
        var img = createElement('img', '300px', '500px');

        el.style.display = 'block';
        el.style.overflow = 'scroll';

        el.appendChild(img);
        parent.appendChild(el);
        document.body.appendChild(parent);

        var res = childrenSize(parent);

        expect(res).to.be.ok();
        expect(res.width).to.equal(100, 'width');
        expect(res.height).to.equal(100, 'height');
    });

    it('should take overflow:auto into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var el = createElement('a', '100px', '100px');
        var img = createElement('img', '300px', '500px');

        el.style.display = 'block';
        el.style.overflow = 'auto';

        el.appendChild(img);
        parent.appendChild(el);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(100, 'width');
        expect(res.height).to.equal(100, 'height');
    });

    it('should take overflow:overlay into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '100px', '100px');
        var img = createElement('img', '300px', '500px');

        try {
            a.style.display = 'block';
            a.style.overflow = 'overlay';
        } catch(e) {
            a.cssText = 'display:block;overflow:overlay;';
        }

        // overlay works the same way as auto
        if (a.style.overflow !== 'overlay') {
            a.style.display = 'block';
            a.style.overflow = 'auto';
        }

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(100, 'width');
        expect(res.height).to.equal(100, 'height');
    });

    // overflow-y and overflow-x does not work as you might think:
    // http://www.brunildo.org/test/Overflowxy2.html
    it('should take overflow-:hidden into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflowY = 'hidden';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);

        expect(res).to.be.ok();
        expect(res.height).to.equal(10, 'height');
        expect(res.width).to.equal(10, 'width');
    });

    it('should take overflow values into account when calculating size for multiple nested children', function () {
        var parent = createDiv('100%');
        var aside = createElement('aside', '200px', '400px');
        var section1 = createElement('section', '200px', '200px');
        var section2 = createElement('section', '200px', '200px');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '300px', '100px');
        var ul = document.createElement('ul', '200px', '200px');
        var li1 = document.createElement('ul', '70px', '200px');
        var li2 = document.createElement('ul', '70px', '300px');
        var li3 = document.createElement('ul', '70px', '300px');

        section1.style.overflow = 'scroll';
        ul.style.overflow = 'hidden';

        aside.appendChild(section1);
        section1.appendChild(a);
        a.appendChild(img);
        section2.appendChild(ul);
        ul.appendChild(li1);
        ul.appendChild(li2);
        ul.appendChild(li3);
        parent.appendChild(aside);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.be.ok();
        expect(res.width).to.equal(200, 'width');
        expect(res.height).to.equal(400, 'height');
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
        expect(res).to.be.ok();
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });
});
