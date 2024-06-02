// ==UserScript==
// @name        stub localStorage
// @author      bkil
// @description Work around breakage of various sites if you disable cookie access. Defines a mock for window.localStorage and sessionStorage. Compatible with JS0.
// @namespace   bkil.hu
// @match       https://*/*
// @grant       none
// @version     2024.6.1
// @license     MIT
// @run-at      document-start
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

// ES5
function Object_defineProperty(o, k, d) {
  if (((typeof Object) !== 'undefined') && (Object.defineProperty)) {
    return Object.defineProperty(o, k, d);
  }
  if (d.get !== undefined) {
    var f = d.get;
    o[k] = f();
  } else {
    o[k] = d.value;
  }
  return o;
}

function getDefinedKeys(o) {
  var l = new Array;
  var i = 0;
  var k;
  for (k in o) {
    if (o[k] !== undefined) {
      l[i] = k;
      i = i + 1;
    }
  }
  return l;
}

function createStorage() {
  var ks = new Object;
  var o = new Object;

  function key(n) {
    var l = getDefinedKeys(ks);
    var k = l[n];
    if (k === undefined) {
      k = null;
    }
    return k;
  };
  function getItem(k) {
    k = '' + k;
    if (ks[k]) {
      return o[k];
    } else {
      return null;
    }
  };
  function setItem(k, v) {
    k = '' + k;
    ks[k] = 1;
    o[k] = '' + v;
  };
  function removeItem(k) {
    k = '' + k;
    if (ks[k]) {
      ks[k] = undefined;
      o[k] = undefined;
    }
  }
  function clear() {
    ks = new Object;
    o = new Object;
  }

  function length_get() {
    var l = getDefinedKeys(ks);
    return l.length;
  };
  var lp = new Object;
  lp.get = length_get;

  var r = new Object;
  Object_defineProperty(r, 'length', lp);
  r.key = key;
  r.getItem = getItem;
  r.setItem = setItem;
  r.removeItem = removeItem;
  r.clear = clear;
  return r;
}

function init() {
  var b = 1;
  var n;
  try {
    n = window.localStorage.length;
    b = b && (typeof n === 'number');
    n = window.sessionStorage.length;
    b = b && (typeof n === 'number');
  } catch (e) {
    b = 0;
  }
  if (!b) {
    var o = new Object;
    o.value = createStorage();
    Object_defineProperty(window, 'localStorage', o);
    o.value = createStorage();
    Object_defineProperty(window, 'sessionStorage', o);
    console.log('localStorage-stub activated');
  }
}

init();
})();
