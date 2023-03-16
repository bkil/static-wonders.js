// ==UserScript==
// @name        qobuz noJS audio
// @author      bkil
// @description Support track preview without extra resources or round trips
// @namespace   bkil.hu
// @match       https://www.qobuz.com/*
// @grant       none
// @version     2023.03.01
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(() => {
'use strict';

const main = () => {
  addStyle();
  document.querySelectorAll('div.track[data-source]').forEach(track => {
    const previewUrl = track.dataset.source;
    track.querySelectorAll('div.pct-play').forEach(play => {
      play.textContent += 'play';
      addPlayButton(play, previewUrl);
    });
  });
};

const addPlayButton = (button, url) => {
  button.onclick = (e) => {
    const player = document.createElement('audio');
    player.controls = true;
    player.autoplay = true;
    player.preload = 'none';
    player.src = url;
    button.parentElement.appendChild(player);
    button.remove();
    player.focus();
  }
};

const addStyle = () => {
  const style = document.createElement('style');
  style.innerText =
    `
    .track__item--number { width: initial; }
    `
  ;
  document.body.appendChild(style);
};

main();
})();
