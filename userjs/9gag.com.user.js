// ==UserScript==
// @name        9gag.com noJS show image
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://9gag.com/gag/*
// @grant       none
// @version     2023.12.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
  'use strict';

  var img = document.head.querySelector('meta[property="og:image"]');
  img = img ? img.content : img;
  if (img) {
    var el = document.createElement('img');
    el.src = img;
    document.body.innerText = '';
    document.body.appendChild(el);
  }
})();
