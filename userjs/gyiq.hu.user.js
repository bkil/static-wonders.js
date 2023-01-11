// ==UserScript==
// @name        gyiq.hu noJS click article
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       http://www.gyiq.hu/*
// @grant       none
// @version     2023.01.01
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

  document.querySelectorAll('input[name="linkIt"][type="hidden"]').forEach(input => {
    const a = document.createElement('a');
    a.href = input.value;
    a.rel = 'noreferrer';
    a.textContent = 'link';
    input.parentElement.appendChild(a);
  });

  const s = document.createElement('style');
  s.innerText = `
    .fa-check-square::after {
      content: '+';
    }

    .fa-chevron-circle-right::after {
      content: '-';
    }

    .cursorLink {
      cursor: initial;
    }
  `;
  document.head.appendChild(s);
})();
