// ==UserScript==
// @name        BBC JSON page content
// @author      bkil
// @description ES5 (JavaScript0, JSON.parse, document.documentElement.innerHTML)
// @namespace   bkil.hu
// @match       https://www.bbc.com/*/article/*
// @grant       none
// @version     2024.5.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

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

function traverseJson(o, j, g) {
  if (j && (typeof j === 'object')) {
    if (j.text) {
      var t = escapeHtml(j.text);
      o.t = o.t + '<p>' + t;
    } else {
      var i;
      for (i in j) {
        g(o, j[i], g);
      }
    }
  }
}

function parseHtml(h) {
  var o = new Object;
  var end;
  var t = 'BBC';
  var i = h.indexOf('<title>');
  if (i > 0) {
    end = h.indexOf('</title>', i);
    if (end > 0) {
      t = h.substring(i, end);
    }
  }

  o.t = '<!DOCTYPE html><html lang=en><head><meta charset=utf-8><link rel="shortcut icon" type=image/x-icon href=data:image/x-icon;,>';
  o.t = o.t + t;
  o.t = o.t + '</title><meta name=viewport content="width=device-width, initial-scale=1"><style>html { background-color: black; color: white; }</style></head><body>';

//  h = document.getElementById('__NEXT_DATA__').textContent;
  i = h.indexOf('>{"props"');
  if (i < 0) {
    o.t = o.t + 'failed to find JSON';
  } else {
    i = i + 1;
    end = h.indexOf('<' + '/script>', i);
    if (end > 0) {
      h = h.substring(i, end);
    } else {
      h = h.substring(i, h.length);
    }

    traverseJson(o, JSON.parse(h), traverseJson);
  }
  o.t = o.t + '</body></html>';
  document.write(o.t);
  document.close();
}

function init() {
  if ((typeof document !== 'undefined') && document.documentElement && document.documentElement.innerHTML) {
    parseHtml(document.documentElement.innerHTML);
  }
}

init();
})();
