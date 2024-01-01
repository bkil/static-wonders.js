// ==UserScript==
// @name        wiki.js.org ietf misskey noJS
// @author      bkil
// @description Minimal viewer of template
// @namespace   bkil.hu
// @match       https://wiki.ietf.org/*
// @match       https://wiki.misskey.io/*
// @grant       none
// @version     2023.12.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

document.querySelectorAll('template').forEach(function(template) {
  document.body.appendChild(template.content.cloneNode(true));
});
