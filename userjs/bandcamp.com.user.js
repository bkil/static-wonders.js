// ==UserScript==
// @name        bandcamp.com noJS audio
// @author      bkil
// @description Support track preview without extra resources or round trips
// @namespace   bkil.hu
// @match       https://*.bandcamp.com/*
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
  const inline = document.querySelector('.inline_player');
  inline ? inline.style = 'display: none' : {};
  const middle = document.querySelector('.middleColumn');
  middle ? middle.style = 'float: initial' : {};

  const container = document.getElementById('propOpenWrapper')[0] ?? document.body;
  const result = document.createElement('div');
  container.prepend(result);
  processJson(result);
};

const processJson = (result) => {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const code = document.createElement('pre');
  code.style = 'white-space: pre-wrap; overflow-wrap: anywhere';
  summary.textContent = '(click to see debug JSON)';
  details.appendChild(summary);
  details.appendChild(code);
  result.appendChild(details);

  const json = readJson();
  if (typeof json === 'string') {
    code.innerText = json;
    details.open = true;
  } else {
    code.innerText = JSON.stringify(json, null, 2);
    addRendered(json);
  }
};

const addRendered = (json) => {
  json.trackinfo?.forEach((info, track) => {
    const previewUrl = (info?.file) ? info.file['mp3-128'] : null;
    const playCont = document.querySelector(`tr[rel="tracknum=${track+1}"] .play-col`);
    const play = playCont?.firstChild;
    if (play && previewUrl) {
      playCont.style = 'width: initial';
      play.textContent = 'play';
      addPlayButton(play, previewUrl);
    } else {
      console.log(track);
      console.log(play);
      console.log(previewUrl);
    }
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

const readJson = () => {
  const selector = 'script[data-tralbum]';
  const text =
    document.querySelector(selector)
      ?.dataset.tralbum
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&amp;', '&')
    ;
  if (!text) {
    return `${selector}\nnot found`;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return `${e}\n${text}`;
  }
};

main();
})();
