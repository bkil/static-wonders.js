// ==UserScript==
// @name        7digital noJS audio
// @author      bkil
// @description Support track preview without extra resources or round trips
// @namespace   bkil.hu
// @match       https://*.7digital.com/artist/*/release/*
// @grant       none
// @version     2023.08.01
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
  document.querySelectorAll('table[data-releaseid]').forEach(tracks => {
    tracks?.querySelectorAll('tr[data-trackid]').forEach(track => {
      const previewUrl = `${location.origin}/stream/release/${tracks.dataset.releaseid}/track/${track.dataset.trackid}/m4a`;
      const play = track.querySelector('button.release-track-play');
      if (play) {
        addPlayButton(play, previewUrl)
      }
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
    .nojs .release-play, .nojs .packshot-preview, .nojs .release-track-play { display: initial !important; }
    .release-track-play::before { content: 'play'; }
    `
  ;
  document.body.appendChild(style);
};

main();
})();
