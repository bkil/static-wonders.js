// ==UserScript==
// @name        maltai map GeoJSON parser
// @author      bkil
// @description JavaScript0
// @namespace   bkil.hu
// @match       https://maltai.hu/tevekenysegkereso
// @grant       none
// @version     2024.1.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

var baseUrl = 'https://maltai.hu';
var dataUrl = baseUrl + '/tevekenysegkereso';

String.prototype.substring = String.prototype.substring || function(from, to) {
  var o = '';
  while ((from < this.length) && (from < to)) {
    o = o + this.charAt(from);
    from = from + 1;
  }
  return o;
};

String.prototype.split = String.prototype.split || function(s) {
  var a = new Array;
  var j = 0;
  var from = 0;
  var i = this.indexOf(s, from);
  while (i >= 0) {
    a[j] = this.substring(from, i);
    j = j + 1;
    from = i + s.length;
    i = this.indexOf(s, from);
  }
  a[j] = this.substring(from, s.length);
  return a;
};

var nl = String.fromCharCode(10);

function escapeJson(s) {
  var hex = '0123456789abcdef';
  var bu00 = String.fromCharCode(92) + 'u00';
  var o = '"';
  var i = 0;
  var c;
  var n;
  while (i < s.length) {
    n = s.charCodeAt(i);
    if (((n === 34) || (n === 92)) || (n < 32)) {
      o = ((o + bu00) + hex[n >> 4]) + hex[n & 15];
    } else {
      o = o + s.charAt(i);
    }
    i = i + 1;
  }
  return o + '"';
}

function parseEntryWithRegex(str, id) {
  var cs = '[ ' + String.fromCharCode(9) + nl + ']*';
  var g = str.match(
    'data-latitude="' + cs + '([0-9.]*)' + cs + '" ' +
    'data-longitude="' + cs + '([0-9.]*)' + cs + '">' + cs +
    '<p class="[^" ]+ csop0([^"]*)">' + cs +
    '<span class="title" data-type="title">([^<>]*)</span><br>' + cs +
    '<span data-type="country" style="display:none;">[^<>]*</span>' + cs +
    '<span data-type="zipcode">([^<>]*)</span>' + cs +
    '<span class="keywords" data-type="city">([^<>]*)</span>,' + cs +
    '<span data-type="address">([^<>]*)</span><br>' + cs +
    '<a class="map-more" href="([^"]*)"'
    );
  if (!g) {
    return '';
  }

  return '{"type":"Feature",' +
    '"geometry":{"type":"Point","coordinates":[' + g[2] + ',' + g[1] + ']},' +
    '"properties":{' +
    '"id":' + escapeJson(id) + ',' +
    '"name":' + escapeJson(g[4]) + ',' +
    '"addr:postcode":' + escapeJson(g[5]) + ',' +
    '"addr:city":' + escapeJson(g[6]) + ',' +
    '"addr:full":' + escapeJson(g[7]) + ',' +
    '"contact:website":' + escapeJson(baseUrl + g[8]) +
    '}}';
}

function parseMaltaiHuMap(h) {
  var ds = h.split('"store"');
  var d;
  var i = 1;
  var ok = '';
  var err = '';
  var r;
  var o = new Object;

  while (i < ds.length) {
    d = ds[i];
    r = parseEntryWithRegex(d, '' + i);
    if (r.length) {
      if (ok.length) {
        ok = ok + ',' + nl;
      }
      ok = ok + r;
    } else {
      err = err + d;
    }
    i = i + 1;
  }
  o.ok = '[' + ok + ']';
  o.err = err;
  return o;
}

function escapeHtmlChar(c) {
  if (c === '&') {
    c = '&amp;';
  } else if (c === '<') {
    c = '&lt;';
  } else if (c === '>') {
    c = '&gt;';
  } else if (c === '"') {
    c = '&quot;';
  } else if (c === "'") {
    c = '&apos;';
  }
  return c;
}

function escapeHtml(h) {
  var t = '';
  var i = 0;
  while (i < h.length) {
    t = t + escapeHtmlChar(h.charAt(i));
    i = i + 1;
  }
  return t;
}

function loaded() {
  if ((typeof document !== 'undefined') && document.documentElement && document.documentElement.innerHTML) {
    var o = parseMaltaiHuMap(document.documentElement.innerHTML);
    document.write('<style>pre{white-space:pre-wrap}</style><pre>' + escapeHtml(o.ok) + '</pre>' + escapeHtml(o.err));
  } else if (typeof fetch !== 'undefined') {
    var f = fetch(dataUrl);
    f = f.then(function(r){ return r.text() });
    f = f.then(function(h) {
      var o = parseMaltaiHuMap(h);
      console.log(o.ok + o.err);
    });
  } else if (typeof require !== 'undefined') {
    var fs = require('fs');
    fs.readFile('maltai.hu__tevekenysegkereso.html', function(e, h) {
      if (!e) {
        var o = parseMaltaiHuMap(h);
        console.log(o.ok + o.err);
      }
    });
  }
}

function init() {
  if ((typeof window !== 'undefined') && window.location && window.location.href && (window.location.href.indexOf(baseUrl + '/') !== 0)) {
    window.location.href = dataUrl;
    return 0;
  }
  setTimeout(loaded, 0);
}

init();
})();
