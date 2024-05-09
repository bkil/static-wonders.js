// ==UserScript==
// @name        gmaps parser GeoJSON generator
// @author      bkil
// @description JavaScript0
// @namespace   bkil.hu
// @match       https://www.google.com/maps/d/embed?mid=*
// @grant       none
// @version     2024.3.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

var matchPrefix = 'https://www.google.com/maps/d/embed?mid=';

// JS1
String.prototype.substring = String.prototype.substring || function(from, to) {
  var o = '';
  var c;
  while ((from < this.length) && (from < to)) {
    c = this.charAt(from);
    o = o + c;
    from = from + 1;
  }
  return o;
};

// ES1, NS3
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
  a[j] = this.substring(from, this.length);
  return a;
};

// ES5
function JSON_parse(s) {
  if ((typeof JSON !== 'undefined') && JSON.parse) {
    return JSON.parse(s);
  } else {
    var i = 0;
    var n;
    var hex = '0123456789abcdef';
    function hex2dec(c) {
      var j = hex.indexOf(c);
      if (j < 0) {
        throw 'invalid hex character code "' + c + '" at position ' + i;
      }
      return j;
    }

    function peekCh() {
      if (i < s.length) {
        n = s.charCodeAt(i);
      } else {
        n = 0;
      }
    }

    function nextCh() {
      i = i + 1;
      peekCh();
    }

    function parseString() {
      var o = '';
      if (n !== 34) {
        throw 'expected " character instead "' + s.charAt(i) + '" at position ' + i;
      }
      nextCh();
      var c;
      while (n !== 34) {
        if (((i + 5) < s.length) && (n === 92) && (s.charCodeAt(i + 1) === 117) &&
            (s.charCodeAt(i + 2) === 48) && (s.charCodeAt(i + 3) === 48)) {
          c = String.fromCharCode((hex2dec(s.charAt(i + 4)) << 4) + hex2dec(s.charAt(i + 5)));
          i = i + 6;
        } else if (((i + 1) < s.length) && (n === 92)) {
          nextCh();
          if (n === 110) {
            c = String.fromCharCode(10);
          } else {
            c = s.charAt(i);
          }
          i = i + 1;
        } else {
          c = s.charAt(i);
          i = i + 1;
        }
        o = o + c;
        peekCh();
      }
      nextCh();
      return o;
    }

    function JSON_parse_0(y) {
      var o;
      var saved;

      if (n === 34) {
        o = parseString();
      } else if (((n > 47) && (n < 58)) || (n === 45)) {
        saved = i;
        o = 0;
        var sign = 0;
        if (n === 45) {
          sign = 1;
          nextCh();
          if ((n < 48) || (n > 57)) {
            throw 'expected number instead "' + s.charAt(i) + '" at position ' + i;
          }
        }
        while ((n > 47) && (n < 58)) {
          o = ((o * 10) + n) - 48;
          nextCh();
        }
        if (n === 46) {
          nextCh();
          while ((n > 47) && (n < 58)) {
            nextCh();
          }
          o = s.substring(saved, i);
        } else if (sign) {
          o = 0 - o;
        }
      } else if (n === 91) {
        var j = 0;
        o = new Array;
        nextCh();
        if (n !== 93) {
          o[j] = y(y);
          j = j + 1;
          while (n === 44) {
            nextCh();
            o[j] = y(y);
            j = j + 1;
          }
          if (n !== 93) {
            throw 'expected ] character instead "' + s.charAt(i) + '" at position ' + i;
          }
        }
        nextCh();
      } else if (n === 123) {
        o = new Object;
        nextCh();
        var k;
        while (n !== 125) {
          k = parseString();
          if (n !== 58) {
            throw 'expected : character instead "' + s.charAt(i) + '" at position ' + i;
          }
          nextCh();
          o[k] = y(y);
          if (n === 44) {
            nextCh();
          }
        }
        nextCh();
      } else if (((i + 3) < s.length) && (n === 110) && (s.charCodeAt(i + 1) === 117) &&
          (s.charCodeAt(i + 2) === 108) && (s.charCodeAt(i + 3) === 108)) {
        o = null;
        i = i + 4;
        peekCh();
      } else if (((i + 3) < s.length) && (n === 116) && (s.charCodeAt(i + 1) === 114) && (s.charCodeAt(i + 2) === 117) &&
          (s.charCodeAt(i + 3) === 101)) {
        o = 1;
        i = i + 4;
        peekCh();
      } else if (((i + 4) < s.length) && (n === 102) && (s.charCodeAt(i + 1) === 97) && (s.charCodeAt(i + 2) === 108) &&
          (s.charCodeAt(i + 3) === 115) && (s.charCodeAt(i + 4) === 101)) {
        o = 0;
        i = i + 5;
        peekCh();
      } else {
        throw 'unexpected character "' + s.charAt(i) + '" at position ' + i;
      }

      return o;
    }

    peekCh();
    var o = JSON_parse_0(JSON_parse_0);
    if (i < s.length) {
      throw 'extra characters at end "' + s.charAt(i) + '" at position ' + i;
    }
    return o;
  }
}

var nl = String.fromCharCode(10);

// ES5
function JSON_stringify(s) {
  if ((typeof JSON !== 'undefined') && JSON.stringify) {
    return JSON.stringify(s);
  } else {
    var hex = '0123456789abcdef';
    var bu00 = String.fromCharCode(92) + 'u00';
    var o = '"';
    var i = 0;
    var c;
    var n;
    while (i < s.length) {
      n = s.charCodeAt(i);
      if (((n === 34) || (n === 92)) || (n < 32)) {
        c = (bu00 + hex[n >> 4]) + hex[n & 15];
      } else {
        c = s.charAt(i);
      }
      o = o + c;
      i = i + 1;
    }
    o = o + '"';
    return o;
  }
}

function traverseJson(o) {
  var j = o.j;
  o.j = undefined;
  j = j[1];
  j = j[6];
  var i = 0;
  var k;
  var layer;
  var list;
  var el;
  var lat;
  var lon;
  var label;
  var prop;
  var id;
  var ok = '[';
  var notFirst = 0;
  while (i < j.length) {
    layer = j[i];
    k = 0;
    list = layer[4];
    while (k < list.length) {
      el = list[k];
      prop = el[4];
      lat = prop[4];
      lon = lat[1];
      lat = lat[0];
      id = JSON_stringify(prop[6]);
      label = el[5];
      label = label[0];
      label = JSON_stringify(label[0]);
      if (notFirst) {
        ok = ok + ',' + nl;
      }
      notFirst = 1;
      ok = ok + '{"type":"Feature",' +
        '"geometry":{"type":"Point","coordinates":[' + lon + ',' + lat + ']},' +
        '"properties":{' +
        '"id":' + id + ',' +
        '"name":' + label +
        '}}';
      k = k + 1;
    }
    i = i + 1;
  }
  ok = ok + ']';
  o.ok = ok;
}

function parseHtml(j) {
  var o = new Object;
  o.err = '';
  o.ok = '';

  j = j.split(' var _pageData = "');
  if (j.length !== 2) {
    o.err = 'Failed to find JSON prefix';
    return o;
  }
  j = j[1].split('";<');
  if (j.length < 2) {
    o.err = 'Failed to find JSON suffix';
    return o;
  }
  j = j[0];
  j = '"' + j + '"';
  try {
    j = JSON_parse(j);
    j = JSON_parse(j);
  } catch (e) {
    o.err = 'JSON parse error: ' + e;
    return o;
  }
  if ((typeof j !== 'object') && (!j[1])) {
    o.err = 'Parsed JSON not array: ' + JSON_stringify(j);
    return o;
  }

  o.j = j;
  j = undefined;
  try {
    traverseJson(o);
  } catch (e) {
    o.err = 'Failed to traverse JSON';
    if (e.stack) {
      o.err = o.err + nl + e.stack;
    } else {
      o.err = o.err + e;
    }
    return o;
  }
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
  var o = '';
  var i = 0;
  var c;
  while (i < h.length) {
    c = escapeHtmlChar(h.charAt(i));
    o = o + c;
    i = i + 1;
  }
  return o;
}

function loaded() {
  if ((typeof document !== 'undefined') && document.documentElement && document.documentElement.innerHTML) {
    var o = parseHtml(document.documentElement.innerHTML);

    if (o.err && (typeof window !== 'undefined') && window.location && window.location.href &&
        (window.location.href.indexOf(matchPrefix) !== 0)) {
      o.ok = 'Before using this bookmarklet, please visit an embedded map URL starting with ' + matchPrefix;
    }

    document.write('<style>pre{white-space:pre-wrap;overflow-x:clip}html{overflow-wrap:anywhere;line-break:anywhere}' +
      'html,body,pre{margin:0;padding:0}</style><pre>' +
      escapeHtml(o.ok) + '</pre><pre>' + escapeHtml(o.err)) + '</pre>';
    document.close();
  } else if ((typeof window !== 'undefined') && window.location && window.location.href && (typeof fetch !== 'undefined')) {
    var f = fetch(window.location.href);
    f = f.then(function(r){ return r.text() });
    f = f.then(function(h) {
      var o = parseHtml(h);
      console.log(o.ok + o.err);
    });
  } else if (typeof require !== 'undefined') {
    var fs = require('fs');
    fs.readFile('g.html', function(e, h) {
      if (!e) {
        var o = parseHtml('' + h);
        console.log(o.ok + o.err);
      }
    });
  }
}

function init() {
  setTimeout(loaded, 0);
}

init();
})();
