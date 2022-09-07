// ==UserScript==
// @name        videa lessJS
// @description Let it run even if you blocked a few trackers
// @author      bkil
// @namespace   bkil.hu
// @match       https://videa.hu/*
// @grant       none
// @version     2022.9.1
// @license     MIT
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

  if (!(typeof window.ga === 'object' && window.ga !== null)) {
    window.ga = function(a, b, c) { return null; };
  }
})();
