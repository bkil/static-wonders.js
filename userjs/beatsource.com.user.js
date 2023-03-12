// ==UserScript==
// @name        beatsource.com noJS audio
// @author      bkil
// @description Support track preview without extra resources or round trips
// @namespace   bkil.hu
// @match       https://www.beatsource.com/release/*
// @match       https://www.beatsource.com/track/*
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
  const result = document.createElement('div');
  const container = document.getElementsByTagName('main')[0] ?? document.body;
  container.prepend(result);
  addRenderedContent(result);
};

const addRenderedContent = (result) => {
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
    const url =
      json?.props?.pageProps?.tracks?.results[0]?.sample_url ??
      json?.props?.pageProps?.track?.sample_url;
    let text = JSON.stringify(json, null, 2);
    if (!url) {
      text = `No preview URL found\n${text}`;
      details.open = true;
    }
    code.innerText = text;

    if (url) {
      const error = addPlayButton(url);
      if (error !== '') {
        code.innerText = `${error}\n${text}`;
        details.open = true;
      }
    }
  }
};

const addPlayButton = (url) => {
  const selector = 'button[data-testid="play_button"]:not(.tilePlayButton)';
  const playButtons = document.querySelectorAll(selector);
  if (playButtons.length) {
    playButtons.forEach(button => {
      button.onclick = (e) => {
        let player = document.createElement('audio');
        player.controls = true;
        player.autoplay = true;
        player.preload = 'none';
        player.src = url;
        button.parentElement.appendChild(player);
        button.parentElement.removeChild(button);
        player.focus();
      }
    });
    return '';
  } else {
    return `No playback button found for selector ${selector}`;
  }
};

const readJson = () => {
  const id = '__NEXT_DATA__';
  const s = document.getElementById(id)?.textContent;
  if (!s) {
    return `No JSON for id #${id}`;
  }

  try {
    return JSON.parse(s);
  } catch (e) {
    return `${e}\n${s}`;
  }
};

main();
})();
