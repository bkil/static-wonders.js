// ==UserScript==
// @name        metager noJS
// @description Navigates to iframe on result page
// @author      bkil
// @namespace   bkil.hu
// @match       https://metager.de/*
// @match       https://metager.org/*
// @grant       none
// @version     2022.9.1
// @license     MIT
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';
  const target = document.querySelector('body > iframe');
  if (target) {
    document.body.innerText += 'Redirecting to results page...';
    window.location = target.src;
  }
})();
