// ==UserScript==
// @name        show lazy load img
// @author      bkil
// @description JS0, DOM2, NS5
// @namespace   bkil.hu
// @match       https://hackaday.io/project/*
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

var baseUrl = 'https://hackaday.io/';

function loaded() {
  var e;
  var src;
  var i = 0;
  while (i < document.images.length) {
    e = document.images[i];
    src = e.getAttribute('data-src');
    if ((e.className === 'lazy') && (!e.src) && src) {
      e.setAttribute('loading', 'lazy');
      e.src = src;
    }
    i = i + 1;
  }
}

function init() {
  if ((typeof window !== 'undefined') && window.location && window.location.href && (window.location.href.indexOf(baseUrl) !== 0)) {
    window.location.href = baseUrl;
    return 0;
  }
  setTimeout(loaded, 0);
}

init();
})();
