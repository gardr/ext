/* jshint expr: true */
var childrenSize = require('../lib/childrensize.js');
var insertCss    = require('../lib/style/insertCss.js');

function createElement (tag, width, height) {
    var element = document.createElement(tag);
    if (width) { element.style.width = width; }
    if (height) { element.style.height = height; }
    element.style.padding = 0;
    element.style.margin = 0;
    return element;
}
var createDiv = createElement.bind(null, 'div');

function instanceOfHTMLCollection (obj) {
    return obj instanceof HTMLCollection;
}

describe('childrenSize', function () {
    it('should not use Array slice', function () {
        var sliceSpy = sinon.spy(Array.prototype, 'slice');
        childrenSize( document.body.appendChild( createDiv('100%', '10px') ) );
        expect(sliceSpy).not.to.have.been.calledOn( sinon.match(instanceOfHTMLCollection) );
    });

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
        expect(res).to.exist;
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
        expect(res).to.exist;
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
        expect(res).to.exist;
        expect(res.width).to.equal(300, 'width');
        expect(res.height).to.equal(400, 'height');
    });


    it('should take overflow:hidden into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflow = 'hidden';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

    it('should take overflow:scroll into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflow = 'scroll';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

    it('should take overflow:auto into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflow = 'auto';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

    it('should take overflow:overlay into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflow = 'overlay';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

    it('should take overflow-x:hidden into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflowX = 'hidden';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

    it('should take overflow-y:hidden into account when calculating nested children size', function () {
        var parent = createDiv('100%');
        var a = createElement('a', '10px', '10px');
        var img = createElement('img', '30px', '50px');

        a.style.display = 'block';
        a.style.overflowY = 'hidden';

        a.appendChild(img);
        parent.appendChild(a);
        document.body.appendChild(parent);

        var res = childrenSize(parent);
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
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
        expect(res).to.exist;
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
        expect(res).to.exist;
        expect(res.width).to.equal(10, 'width');
        expect(res.height).to.equal(10, 'height');
    });

});
