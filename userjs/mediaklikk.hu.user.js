// ==UserScript==
// @name        mediaklikk noJS audio
// @author      bkil
// @description Play audio stream of radio
// @namespace   bkil.hu
// @match       https://mediaklikk.hu/*
// @match       https://www.mediaklikk.hu/*
// @grant       none
// @version     2022.12.02
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';
main();

function main() {
  addStyle();
  startLivePlayback();
  enableOnDemandPlayback();
  enableLivePlayback();
}

function startLivePlayback() {
  // https://mediaklikk.hu/parlamenti-adasok-elo/
  document.querySelectorAll('script').forEach(script => {
    const match = script.text.match(/\bvar radioStreamUrl = '([^']*[^\/])'/);
    if (match) {
      const player = createPlayer(match[1])
      document.body.prepend(player);
      player.focus();
    }
  });
}

function enableOnDemandPlayback() {
  // https://mediaklikk.hu/musorujsag/#programGuideRadio
  document.querySelectorAll('#programGuideRadio .program_body:not(.live) .program_about button[onclick]').forEach(button => {
    const match = button.getAttribute('onclick').match(/^openRadioPGWindow\('([^']*)', '([^']*)'/);
    if (match) {
      const timestamp = `${match[1]}/${match[2]}`.replace(/[ :-]/g, '');
      const url = `https://hangtar-cdn.connectmedia.hu/${timestamp}/mr5.mp3`;
      button.parentElement.appendChild(createPlaceholder(url));
      button.parentElement.removeChild(button);
    }
  });
}

function enableLivePlayback() {
  // https://mediaklikk.hu/musorujsag/#programGuideRadio
  document.querySelectorAll('#programGuideRadio .live .program_about button[onclick]').forEach(button => {
    const match = button.getAttribute('onclick').match(/^window\.open\('(\/\/mediaklikk\.hu\/[^']*)'/);
    if (match) {
      const a = document.createElement('a');
      a.href = match[1];
      a.target = '_programguide_playbackPopupVideo';
      a.textContent = 'Play live';
      a.rel = 'noreferrer noopener';
      a.referrerPolicy = 'no-referrer';
      button.parentElement.appendChild(a);
      button.parentElement.removeChild(button);
    }
  });
}

function createPlaceholder(url) {
  const button = document.createElement('button');
  button.textContent = 'Play recording';

  button.onclick = function() {
    const player = createPlayer(url);
    button.parentElement.appendChild(player);
    button.parentElement.removeChild(button);
    player.focus();
  }

  return button;
}

function createPlayer(url) {
  const player = document.createElement('audio');
  player.src = url;
  player.controls = true;
  player.autoplay = true;

  player.onplay = function() {
    Array.from(document.getElementsByTagName('audio')).forEach(audio => {
      if (audio.src !== url) {
        audio.pause();
      }
    });
  }

  return player;
}

function addStyle() {
  const style = document.createElement('style');
  style.textContent = `
    li.program_body {
      cursor: initial;
    }

    #programGuideRadio .program_about,
    body > div[style="display: none;"] {
      display: initial !important;
    }

    .program_about a, .program_about a:visited {
      outline: auto;
      background-color: white;
      color: initial;
      text-decoration: initial;
    }
    `;
  document.body.appendChild(style);
}

})();
