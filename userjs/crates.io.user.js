// ==UserScript==
// @name        JS;DR crates.io -> lib.rs
// @author      bkil
// @description Redirect
// @namespace   bkil.hu
// @match       https://crates.io/crates/*
// @grant       none
// @version     2023.10.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function nthIndexOf(needle, haystack, n) {
  var pos = -1;
  var i = 0;
  while (n >= i) {
    pos = haystack.indexOf(needle, pos + 1);
    if (pos < 0) {
      return pos;
    }
    i = i + 1;
  }
  return pos;
}

function init() {
  var url = window.location.href;
  var start = nthIndexOf('/', url, 3);
  if (start < 0) {
    return;
  }
  var end = nthIndexOf('/', url, 4);
  if (end < 0) {
    end = url.length + 1;
  }
  var s = 'https://lib.rs/crates/' + url.substring(start + 1, end - 1);
  window.location.href = s;
}

init();
})();
