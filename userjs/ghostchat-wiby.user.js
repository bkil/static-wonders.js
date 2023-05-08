// ==UserScript==
// @name        chat.wiby JS
// @author      bkil
// @description Minimal AJAX web app with chat log and more efficient polling
// @namespace   bkil.hu
// @match       https://wiby.me/chat/
// @grant       none
// @version     2023.5.1
// @license     MIT
// @run-at      document-start
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

const baseUrl = window.location.href.replace(/[^\/]*$/, '');
const feedUrl = baseUrl + 'feed.html';
const postUrl = baseUrl + 'post';
let nextUpdateTime;
let state;

const init = () => {
  if (document.documentElement) {
    document.documentElement.remove();
  }
  const doc = document.createElement('html');
  document.appendChild(doc);

  doc.innerHTML = `
    <head>
    <meta charset=utf-8>
    <title>GhostChat-JS</title>
    <link rel='shortcut icon' type=image/x-icon href=data:image/x-icon;,>
    <meta name=referrer content=no-referrer>
    <meta name=viewport content='width=device-width, initial-scale=1.0'>
    <meta http-equiv=x-dns-prefetch-control content=off>
    <meta http-equiv='Content-Security-Policy' content="default-src 'none'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none';">
    <style>
      html {
        background-color: black;
        color: white;
      }

      th, td {
        border-left: 1px solid white;
        padding-left: 0.5em;
        padding-right: 0.5em;
      }

      textarea {
        display: block;
        min-width: 100%;
        max-width: 100%;
        min-height: 2em;
        background-color: black;
        color: white;
      }

      .comment {
        overflow-wrap: anywhere;
      }

      .timestamp {
        white-space: nowrap;
      }

      .isMyCloak {
        font-weight: bold;
        text-decoration: underline;
      }

      .isMentionMe {
        text-decoration: underline;
        background-color: #400;
      }

      .cloak {
        font-family: monospace;
      }

      #error {
        color: red;
      }

      #counter {
        font-style: italic;
      }
    </style>
    </head>

    <body>
    <div id=log></div>
    <form method=POST action=#>
      <textarea disabled name=message id=message maxlength=180 rows=2 columns=90></textarea>
      <input id=submit type=submit value=Post>
      <span id=counter></span>
      <span id=status></span>
      <span id=error></span>
    </form>
    </body>
    `;

  loadState();
  const messageBox = document.getElementById('message');
  messageBox.value = state.textbox ?? '';
  updateCounter();
  messageBox.oninput = updateCounter;
  messageBox.disabled = false;
  document.getElementById('submit').scrollIntoView();
  messageBox.focus();

  document.forms[0].onsubmit = onSubmit;
  updateFeed();
};

const updateCounter = () => {
  const len = document.getElementById('message').value.length;
  document.getElementById('counter').textContent = len > 0 ? len : '';
};

const storageKey = 'spa_state';

const loadState = () => {
  let loaded;
  try {
    loaded = JSON.parse(window.localStorage.getItem(storageKey));
  } catch (e) {
    console.log(e);
  }

  if (loaded && (typeof loaded === 'object') && (!Array.isArray(loaded))) {
    state = loaded;
    migrateDb();
  } else {
    state =
      {
        version: 1,
        key: {},
        log: [],
        postedMessage: null,
        postedTime: null,
        zone: null,
        lastCloak: null,
        lastCloakDay: null,
        textbox: null,
        myCloaks: [],
        lastMention: null,
        lastModified: null,
        pollMinSecond: 38,
        pollMaxSecond: 600,
        pollSecond: 38,
      };
  }
};

const migrateDb = () => {
  if ((typeof state.key !== 'object') || (Array.isArray(state.key))) {
    state.key = {};
  }
  if (!Array.isArray(state.log)) {
    state.log = [];
  }
  if (!Array.isArray(state.myCloaks)) {
    state.myCloaks = [];
  }

  if (state.version === 0) {
    state.pollMinSecond = 38;
    state.pollMaxSecond = 600;
    state.pollSecond = state.pollMinSecond;
    state.version = 1;
  }
};

const saveState = () => {
  state.textbox = document.getElementById('message').value;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) {
    console.log(e);
  }
};

const scheduleUpdate = () => {
  clearTimeout(nextUpdateTime);
  nextUpdateTime = setTimeout(updateFeed, 1000 * state.pollSecond);
};

const updateFeed = () => {
  const nonce = state.lastModified ? '' : ('?_ts=' + Math.trunc(new Date() / 1000));
  fetch(feedUrl + nonce,
    (body, lastModified) => {
      state.lastModified = lastModified,
      gotFeedUpdate(body);
      saveState();
    },
    _ => {
      saveState();
      increasePollDelay();
      scheduleUpdate();
    },
    null,
    state.lastModified
  );
};

const gotFeedUpdate = (body) => {
  const now = new Date();
  if (!state.zone) {
    state.zone = -now.getTimezoneOffset();
  }
  const today = new Date(+now - state.zone * 60000);
  let year = today.getFullYear();
  let month = today.getMonth();
  let day = today.getDate();
  let lastTime = today.getHours() * 60 + today.getMinutes();

  const chat = body.replace(/^(.|\n)*<body>\n*[^<>]*<br>\n*/, '').match(/^((?:[^<>]|\s|<br>)*)/) ?? [];
  const lines = [];
  chat[1]?.split('<br>\n').forEach(row => {
    const m = row.match(/^([0-9]+):([0-9]+) &lt;([0-9a-z]+)&gt; (.*)$/);
    if (m) {
      lines.push([m[1], m[2], m[3], m[4]]);
    }
  });

  let i = lines.length;
  let updates = [];
  while (--i >= 0) {
    const [hours, mins, cloak, message] = lines[i];
    const hhmm = `${hours}:${mins}`;
    const hour = parseInt(hours);
    const min = parseInt(mins);
    const key = `${hhmm}\n${cloak}\n${message}`;
    if (state.key[key] !== undefined) {
      break;
    }

    const newTime = hour * 60 + min;
    if ((lastTime !== null) && (newTime > lastTime)) {
      const yesterday = new Date(year, month, day - 1, hour, min + state.zone);
      year = yesterday.getFullYear();
      month = yesterday.getMonth();
      day = yesterday.getDate();
    }
    lastTime = newTime;

    let isCloakNew = false;
    if (state.postedTime && state.postedMessage && (message === state.postedMessage)) {
      if ((state.zone === null) || (state.lastCloakDay !== day)) {
        const zeroTime = new Date(year, month, day, hour, min);
        state.zone = round((new Date(state.postedTime) - zeroTime) / 60000, 15);
        if (cloak !== state.lastCloak) {
          state.lastCloak = cloak;
          isCloakNew = true;
        }
        state.lastCloakDay = day;
      }

      state.postedMessage = null;
      state.postedTime = null;
    }
    const time = +new Date(year, month, day, hour, min + state.zone);
    if (isCloakNew) {
      rotateCloaks(cloak, time);
    }
    updates.push(
      {
        time: time,
        hhmm: hhmm,
        cloak: cloak,
        isMe: cloak === state.lastCloak,
        isMentionMe: state.myCloaks.findIndex(c => message.includes(c.cloak)) >= 0,
        message: message,
      });
  }

  if (updates.length || !(state.pollSecond >= state.pollMinSecond)) {
    resetPollDelay();
  } else {
    increasePollDelay();
  }

  updates.reverse().forEach(u => {
    const key = `${u.hhmm}\n${u.cloak}\n${u.message}`;
    state.key[key] = state.log.length;
    state.log.push(u);
  });

  console.log(state);

  const tab = document.createElement('table');
  state.log.forEach(u => {
    const tr = tab.insertRow();

    const stamp = tr.insertCell();
    stamp.textContent = new Date(u.time).toLocaleString().replace(':00 ', ' ');
    stamp.classList.add('timestamp');
    if (u.isMentionMe) {
      stamp.classList.add('isMentionMe');
    }

    const cloak = tr.insertCell();
    cloak.textContent = u.cloak;
    cloak.classList.add('cloak');
    cloak.style.color = getCloakColor(u.cloak);
    if (u.isMe) {
      cloak.classList.add('isMyCloak');
    }

    const comment = tr.insertCell();
    comment.classList.add('comment');
    comment.textContent = unHTML(u.message);
  });

  const cont = document.getElementById('log');
  cont.innerHTML = '';
  cont.appendChild(tab);

  document.getElementById('status').textContent = now.toLocaleTimeString();
  const messageBox = document.getElementById('message');
  document.getElementById('submit').scrollIntoView();
  messageBox.focus();
  scheduleUpdate();
};

const resetPollDelay = () => {
  state.pollSecond = state.pollMinSecond;
};

const increasePollDelay = () => {
  state.pollSecond *= 2;
  if (state.pollSecond > state.pollMaxSecond) {
    state.pollSecond = state.pollMaxSecond;
  }
};

const rotateCloaks = (cloak, timeSec) => {
  if (state.myCloaks.length > 6) {
    const cloaks = state.myCloaks.sort((x, y) => y.time - x.time);
    cloaks.pop();
    state.myCloaks = cloaks;
  }
  state.myCloaks.push({time: timeSec, cloak: cloak});
};

const unHTML = (s) => {
  return s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    ;
};

const round = (n, mod) => Math.trunc(n / mod) * mod;

const getCloakColor = (cloak) => {
  const hash = Array.from(cloak)
    .reduce(
      (a,x) => ((a << 4) ^ (a >> 8) ^ x.charCodeAt(0)) & 0xfff,
      cloak.length);
  const color = 0x808080 | ((hash & 0x00f) << 3) | ((hash & 0x0f0) << 7) | ((hash & 0xf00) << 11);
  return `#${color.toString(16)}`;
};

const onSubmit = (e) => {
  e.preventDefault();
  const error = document.getElementById('error');
  error.hidden = true;
  const message = document.getElementById('message');
  message.disabled = true;
  const text = message.value.trim();
  if (!text.length) {
    message.disabled = false;
    updateFeed();
    return;
  }

  state.postedMessage = text;
  state.postedTime = +new Date();
  saveState();

  fetch(
    postUrl,
    (body, lastModified) => {
      message.value = '';
      updateCounter();
      saveState();
      message.disabled = false;
      updateFeed();
    },
    (body, code) => {
      error.textContent = `post error: HTTP ${code}`;
      error.hidden = false;
      saveState();
      message.disabled = false;
      resetPollDelay();
      scheduleUpdate();
    },
    `message=${encodeURIComponent(text)}`,
    null
  );
};

const fetch = (url, ok, err, body, lastModified) => {
  if (document.cookie.includes('PHPSESSID')) {
    document.cookie = 'PHPSESSID=; path=/; max-age=0';
  }

  const x = new XMLHttpRequest();
  x.open(body ? 'POST' : 'GET', url);
  if (body) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  } else if (lastModified) {
    x.setRequestHeader('If-Modified-Since', lastModified);
  }
  ['Accept', 'Accept-Language'].forEach(h => {
    try {
      x.setRequestHeader(h, '');
    } catch (e) {
    }
  });

  x.onload = () => {
    if ((x.status >= 200) && (x.status <= 299) || (x.status === 304)) {
      ok(x.responseText, x.getResponseHeader('Last-Modified'));
    } else if (err) {
      err(x.responseText, x.status);
    }
  };
  x.onerror = (e) => {
    if (err) {
      err(x.responseText, x.status);
    } else {
      console.log(e);
    }
  };
  x.ontimeout = x.onerror;
  x.timeout = 1000 * (state.pollSecond - 1);
  x.send(body);
};

init();
})();
