// ==UserScript==
// @name        wiki.ietf.org noJS
// @author      bkil
// @description Minimal viewer of template
// @namespace   bkil.hu
// @match       https://wiki.ietf.org/*
// @grant       none
// @version     2023.7.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

document.querySelectorAll('template').forEach(function(template) {
  document.body.appendChild(template.content.cloneNode(true));
});
