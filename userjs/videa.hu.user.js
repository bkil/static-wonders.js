// ==UserScript==
// @name        videa lessJS
// @namespace   Violentmonkey Scripts
// @match       https://videa.hu/*
// @grant       none
// @version     1.0
// @author      bkil
// @description Let it run even if you blocked a few trackers
// ==/UserScript==

(function() {
'use strict';

  if (!(typeof window.ga === 'object' && window.ga !== null)) {
    window.ga = function(a, b, c) { return null; };
  }
})();
