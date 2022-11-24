// ==UserScript==
// @name        deezer.com noJS reveal + og:audio + JSON
// @author      bkil
// @description Support track preview without extra resources or round trips
// @namespace   bkil.hu
// @match       https://www.deezer.com/en/track/*
// @match       https://www.deezer.com/en/album/*
// @match       https://www.deezer.com/en/artist/*
// @grant       none
// @version     2022.11.19
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
  const result = document.createElement('div');
  result.className = 'userscript';

  addRenderedContent(result);

  let container = document.querySelector('#naboo_track_head + *, #naboo_album_head + *, #naboo_artist_cover_classic + *');
  if (container) {
    container.parentNode.insertBefore(result, container);
  } else {
    document.body.prepend(result);
  }

  addStyle();
}

function addStyle() {
  let style = document.createElement('style');
  style.className = 'userscript';
  style.textContent =
    'pre { white-space: pre-wrap; overflow-x: auto; }' +
    'summary { cursor: pointer; }' +
    '.hidden, .invisible { visibility: initial !important; display: initial !important }' +
    '.popularity::after { content: attr(title) }' +
    '.userscript th, .userscript td { border-left: 1px solid; border-bottom: 1px solid; padding: 4px }' +
    '.userscript { color: initial }'
  ;
  document.head.appendChild(style);
}

function getJson() {
  const scripts = document.getElementsByTagName('script');
  const prefix = "window.__DZR_APP_STATE__ = ";

  let script = '';
  let prefixPos = -1;
  for (let i = 0; (i < scripts.length) && (prefixPos !== 0); i++) {
    script = scripts[i].text;
    prefixPos = script.indexOf(prefix);
  }
  if (prefixPos !== 0) {
    return '';
  }

  const line = script
    .substr(prefixPos + prefix.length);

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}

function addRenderedContent(result) {
  const json = getJson();
  let added = false;
  if (typeof json === 'object') {
    if (json.DATA) {
      added |= addAlbum(result, json.DATA, json, true);
    }

    if (json.ALBUMS && json.ALBUMS.data) {
      Array.from(json.ALBUMS.data).forEach(album =>
        added |= addAlbum(result, album, album, false)
      );
    }

    if (!added) {
      added |= addSongs(result, [json.DATA]);
    }
  }

  if (!added) {
    const preview = document.head.querySelector('meta[property="og:audio"][content]');
    if (preview) {
      result.appendChild(createPlaceholder(preview.content));
    }
  }

  addDebugInfo(result, json);
}

function addAlbum(result, m, j, open) {
  if (!m.ARTISTS || !m.ALB_TITLE || !j.SONGS || !j.SONGS.data) {
    return false;
  }

  const details = document.createElement('details');
  const summary = document.createElement('summary');

  const label = m.LABEL_NAME ? ', ' + m.LABEL_NAME : m.PRODUCER_LINE ? ', ' + m.PRODUCER_LINE : '';
  const date = m.ORIGINAL_RELEASE_DATE ? m.ORIGINAL_RELEASE_DATE : m.PHYSICAL_RELEASE_DATE ? m.PHYSICAL_RELEASE_DATE : '';
  const artists = Array.from(m.ARTISTS).map(m => m.ART_NAME).join(', ')
  summary.textContent = artists + ': ' + m.ALB_TITLE + ' (' + date + label + ')';
  details.appendChild(summary);
  details.open = open;

  const success = addSongs(details, j.SONGS.data);
  result.appendChild(details);
  return success;
}

function addSongs(result, songs) {
  const table = document.createElement('table');
  const body = table.createTBody();
  let success = false;

  Array.from(songs).forEach(s => {
    const row = body.insertRow();

    row.insertCell().textContent = s.TRACK_NUMBER ? s.TRACK_NUMBER : '';
    row.insertCell().textContent = s.SNG_TITLE ? s.SNG_TITLE : '';
    row.insertCell().textContent = s.ART_NAME ? s.ART_NAME : '';
    const play = row.insertCell();

    if (s.MEDIA && s.MEDIA[0] && s.MEDIA[0].HREF) {
      play.appendChild(createPlaceholder(s.MEDIA[0].HREF));
      success = true;
    }
  });

  result.appendChild(table);
  return success;
}

function createPlaceholder(url) {
  const button = document.createElement('button');
  button.textContent = 'play';

  button.onclick = function() {
    const player = createPlayer(url);
    button.parentElement.appendChild(player);
    button.parentElement.removeChild(button);
    player.autoplay = true;
  }
  return button;
}

function createPlayer(url) {
  const player = document.createElement('audio');
  player.controls = true;
  player.preload = 'none';
  player.src = url;

  player.onplay = function() {
    Array.from(document.getElementsByTagName('audio')).forEach(audio => {
      if (audio.src !== url) {
        audio.pause();
      }
    });
  }
  return player;
}

function addDebugInfo(result, json) {
  let details = document.createElement('details');
  let summary = document.createElement('summary');
  summary.textContent = '(click to see debug JSON)';
  details.appendChild(summary);

  addJson(details, json);
  result.appendChild(details);
}

function addJson(result, json) {
  const code = document.createElement('pre');
  if (typeof json === 'string') {
    code.textContent = json;
  } else {
    code.textContent = JSON.stringify(json, null, 2);
  }
  result.appendChild(code);
}

})();
