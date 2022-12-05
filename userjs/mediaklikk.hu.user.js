// ==UserScript==
// @name        mediaklikk noJS audio
// @author      bkil
// @description Play audio stream of radio
// @namespace   bkil.hu
// @match       https://mediaklikk.hu/*
// @match       https://www.mediaklikk.hu/*
// @grant       none
// @version     2022.12.01
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
  'use strict';

  document.querySelectorAll('script[type="text/javascript"]:not([src]):not([id])').forEach(script => {
    const match = script.text.match(/\bvar radioStreamUrl = '([^']*)'/);
    if (match) {
      const player = document.createElement('audio');
      player.src = match[1];
      player.controls = true;
      player.autoplay = true;
      document.body.prepend(player);
    }
  });
})();
