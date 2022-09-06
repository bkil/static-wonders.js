// ==UserScript==
// @name        gigablast noJS
// @description Fetch results via AJAX
// @author      bkil
// @namespace   bkil.hu
// @match       https://gigablast.com/*
// @grant       none
// @version     2022.9.1
// @license     MIT
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

  function get(url) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange =
      function() {
        if (this.readyState == 4) {
          document.getElementById('bodycont').innerHTML = this.responseText;
        }
      }
    xhr.open('GET', url);
    xhr.send();
  }

  const r =
    document.body.getAttribute('onload')
    .match(/(&rand=[^']*)(.|\n)*(pxb=[^']*)/);
  if (r) {
    get(window.location + r[1] + r[3]);
  } else {
    document.getElementById('bodycont').innerText = 'UserJS failed to parse nonce from HTML';
  }
})();
