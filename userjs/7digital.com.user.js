// ==UserScript==
// @name        7digital noJS audio
// @author      bkil
// @description Support track preview without extra resources or round trips
// @namespace   bkil.hu
// @match       https://*.7digital.com/artist/*/release/*
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
  document.querySelectorAll('tr[data-trackid]').forEach(track => {
    const trackId = track.dataset.trackid;
    track.querySelectorAll('.release-track-preview').forEach(td => {
      const releaseUrl = td.querySelector('meta[itemprop="url"][content]').content;
      const i = releaseUrl.lastIndexOf('-') + 1;
      if (i >= 0) {
        const releaseId = releaseUrl.substr(i);
        const previewUrl = `${location.origin}/stream/release/${releaseId}/track/${trackId}/m4a`;
        td.querySelectorAll('button.release-track-play').forEach(play =>
          addPlayButton(play, previewUrl)
        );
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
