// ==UserScript==
// @name        gigablast noJS
// @description Fetch results via AJAX
// @author      bkil
// @namespace   bkil.hu
// @match       https://gigablast.com/*
// @grant       none
// @version     2022.12.2
// @license     MIT
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

  function init(style) {
    const s = document.createElement('style');
    s.textContent = style;
    document.head.appendChild(s);
    const r =
      document.body.getAttribute('onload')
      ?.match(/(&rand=[^']*)'([^']|\n)*'([^']*)'/);
    if (r) {
      get(window.location + r[1] + r[3]);
    } else {
      document.getElementById('bodycont').innerText = 'UserJS failed to parse nonce from HTML';
    }
  }

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

init(`
    #filters {
        line-height: initial !important;
        max-width: initial !important;
    }

    #filters #hiddenfilters {
        display: inline-block !important;
    }

    #filters #hiddenfilters > nobr {
        display: none;
    }

    #filters #hiddenfilters span[onmousedown] {
        display: inline-block !important;
        position: initial !important;
        max-height: 7em !important;
        font-size: xx-small;
        margin: 0 !important;
    }

    #filters #hiddenfilters div {
        padding: 0 !important;
    }
  `);
})();
