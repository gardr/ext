var insertCSS = require('../../style/insertCss.js');
var timer = require('../../timer.js');

var outDiv = null;
var startTime = new Date().getTime();
var OUTPUT_ID = 'logoutput';

function addOutDivToBody () {
    if (document.body) {
        document.body.appendChild(outDiv);
    } else {
        timer(addOutDivToBody, 0);
    }
}

function generateCSS() {
    var rules = [
        ['{',
            'position:absolute',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'overflow:scroll',
            'padding:10px',
            'opacity:0.8',
            'background-color:black',
            'color:white',
            'font-family:monospace',
            'font-weight:bold',
            'font-size:10px',
            'z-index:9999',
            'white-space:nowrap',
            'border:5px solid transparent',
            'box-sizing:border-box',
            'background-clip:padding-box',
            'border-radius:10px',
        '}'].join(';'),
        '.info {color:blue}',
        '.warn {color:orange}',
        '.error {color:red}'
    ].map(function (rule) {
        return ['#',OUTPUT_ID,' ',rule].join('');
    });
    insertCSS(rules.join('\n'));
}

function createOverlay () {
    var div = document.createElement('div');
    div.id = OUTPUT_ID;
    return div;
}

var levelToText = {
    1: 'ERROR',
    2: 'WARN',
    3: 'INFO',
    4: 'DEBUG'
};
function logMessage (logObj) {
    var level = levelToText[logObj.level];
    var scriptErr = (logObj.url && logObj.line);
    var out = [
        '<span class="' + level.toLowerCase() + '">',
        '<span class="time">', (logObj.time - startTime), ' ms</span>',
        levelToText[logObj.level],
        logObj.msg
    ];

    if (scriptErr) {
        out.push.call(out, '<a href="'+logObj.url+'" target="_blank" class="script">',
            logObj.url+':'+logObj.line, '</a>');
    }
    out.push('</span>');
    return out.join(' ');
}

var activeTimer = null;
var docFrag = null;
function appendLogMessage (el) {
    clearTimeout(activeTimer);
    docFrag = docFrag || document.createDocumentFragment();
    docFrag.appendChild(el);

    activeTimer = timer(function () {
        outDiv.appendChild(docFrag);
        docFrag = null;
    }, 50);
}

function logOut (logObj) {
    if (!outDiv) {
        outDiv = createOverlay();
        insertCSS(generateCSS());
        addOutDivToBody();
    }
    var div = document.createElement('div');
    div.innerHTML = logMessage(logObj);
    appendLogMessage(div);
}

logOut.reset = function () {
    clearTimeout(activeTimer);
    if (!outDiv) {
        outDiv = document.getElementById(OUTPUT_ID);
    }
    if (outDiv) {
        if (outDiv.parentElement) {
            outDiv.parentElement.removeChild(outDiv);
        }
        outDiv = null;
    }
    if (docFrag) {
        docFrag = null;
    }
};

module.exports = logOut;
