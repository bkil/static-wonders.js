// ==UserScript==
// @name        metager noJS
// @description Navigates to iframe on result page
// @author      bkil
// @namespace   bkil.hu
// @match       https://metager.de/*
// @match       https://metager.org/*
// @grant       none
// @version     2023.1.1
// @license     MIT
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';
  const url =
    document.querySelector('iframe')?.src ??
      document.querySelector('noscript')?.textContent
      .replace(/^(?:.|\n)*<iframe [^<>]*\bsrc="([^"<>]+)"(?:.|\n)*$/, '$1')
      .replaceAll('&amp;', '&');

  if (url) {
    document.body.innerText += 'Redirecting to results page...';
    window.location = url;
  }
})();
