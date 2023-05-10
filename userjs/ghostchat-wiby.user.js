// ==UserScript==
// @name        chat.wiby JS
// @author      bkil
// @description Minimal AJAX web app with chat log and more efficient polling
// @namespace   bkil.hu
// @match       https://wiby.me/chat/
// @grant       none
// @version     2023.5.9
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
        border-top: 1px solid;
      }

      #error {
        color: red;
      }

      #counter {
        font-style: italic;
      }

      #emoji {
        position: fixed;
        top: 0;
        left: 0;
        max-height: calc(100vh - 2em - 2px);
        border: 1px solid;
        margin: 0.5em;
        padding: 0.5em;
        padding-right: 1.5em;
        overflow-y: scroll;
        background-color: black;
        line-height: 1.5em;
      }

      #emoji span {
        display: inline-block;
        padding: 0.25em;
        width: 1.5em;
        height: 1.5em;
        text-align: center;
      }

      #emoji span[data-char]:hover::before {
        position: absolute;
        content: attr(data-char);
        font-size: xx-large;
        background-color: black;
        padding: 0.5em;
        margin-left: -0.75em;
        margin-top: -0.5em;
        border: 1px solid;
      }

      html.js-emoji-selector {
        overflow-y: hidden;
      }

      html.js-emoji-selector #foreground,
      html:not(.js-emoji-selector) #emoji {
        visibility: hidden;
      }

    </style>
    </head>

    <body>
    <div id=foreground>
      <div id=log></div>
      <form method=POST action=#>
        <textarea disabled name=message id=message maxlength=180 rows=2 columns=90></textarea>
        <input id=send type=submit data-value_refresh='Refresh (sh+enter)' data-value_post='Post (sh+enter)' accesskey=p>
        <button disabled id=show_emoji type=button>emoji</button>
        <span id=counter></span>
        <span id=status></span>
        <span id=error></span>
      </form>
    </div>
    <div id=emoji>
      <div id=js-emoji></div>
    </div>
    </body>
    `;

  loadState();

  const messageBox = document.getElementById('message');
  messageBox.value = state.textbox ?? '';
  updateCounter();
  messageBox.oninput = updateCounter;
  messageBox.disabled = false;
  document.getElementById('send').scrollIntoView();
  messageBox.focus();

  document.forms[0].onsubmit = onSubmit;
  messageBox.onkeypress = e => {
    if ((e.key === 'Enter') && (e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      document.forms[0].requestSubmit();
    }
  };
  updateFeed();
};

const updateCounter = () => {
  const len = normalizeEnteredText(document.getElementById('message').value).length;
  const counter = document.getElementById('counter');
  const submit = document.getElementById('send');
  if (len) {
    counter.textContent = len;
    submit.value = submit.dataset.value_post;
  } else {
    counter.textContent =  '';
    submit.value = submit.dataset.value_refresh;
  }
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
      initEmojiPicker();
    },
    _ => {
      saveState();
      increasePollDelay();
      scheduleUpdate();
      initEmojiPicker();
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

  const escapedMessage = state.postedMessage ? escapeWibyHTML(state.postedMessage) : null;
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
    if (state.postedTime && state.postedMessage && (message === escapedMessage)) {
      const zeroTime = new Date(year, month, day, hour, min);
      state.zone = round((new Date(state.postedTime) - zeroTime) / 60000, 15);
      if (cloak !== state.lastCloak) {
        state.lastCloak = cloak;
        isCloakNew = true;
      }

      state.lastCloakDay = day;
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

  const allSeenCloaks = new Set();
  let lastLineCloak;
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
    if (u.cloak !== lastLineCloak) {
      cloak.textContent = u.cloak;
      cloak.classList.add('cloak');
      cloak.style.color = getCloakColor(u.cloak);
      if (u.isMe) {
        cloak.classList.add('isMyCloak');
      }
      allSeenCloaks.add(u.cloak);
    }
    lastLineCloak = u.cloak;

    const comment = tr.insertCell();
    comment.classList.add('comment');
    let colored = escapeHTML(u.message);
    allSeenCloaks.forEach(cl => {
      const color = getCloakColor(cl);
      colored = colored.replace(
        new RegExp(`@?\\b${cl}\\b:?`, 'g'),
        m => `<span style=color:${color}>${m}</span>`)
    });
    comment.innerHTML = markup(colored);
  });

  const cont = document.getElementById('log');
  cont.innerHTML = '';
  cont.appendChild(tab);

  document.getElementById('status').textContent = now.toLocaleTimeString();
  const messageBox = document.getElementById('message');
  document.getElementById('send').scrollIntoView();
  messageBox.focus();
  scheduleUpdate();
};

const escapeWibyHTML = (s) => {
  return s
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    ;
};

const escapeHTML = (s) => {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    ;
};

const markup = (s) => {
  const proto = `(?:(?:https?|gemini|gopher):\/\/|mailto:)`;
  const link = `(${proto})?([0-9a-z.-]+\\.[a-z]{2,14}(?:\/(?:[^ <>&]|&amp;)*)?)`;
  return s
    .replaceAll(' ', '&#32;')
    .replace(/(^|\s|;)__([^_<>]*)__(&#|\s|$)/g, '$1<u>$2</u>$3')
    .replace(/(^|\s|;)_([^_<>]*)_(&#|\s|$)/g, '$1<em>$2</em>$3')
    .replace(/(^|\s|;)[*][*]([^*<>]*)[*][*](&#|\s|$)/g, '$1<strong>$2</strong>$3')
    .replace(/(^|\s|;)[*]([^*<>]*)[*](&#|\s|$)/g, '$1<em>$2</em>$3')
    .replace(/(^|\s|;)~~([^~<>]*)~~(&#|\s|$)/g, '$1<del>$2</del>$3')
    .replace(/(^|\s|;)`([^`<>]*)`(&#|\s|$)/g, '$1<code>$2</code>$3')
    .replace(/&amp;lt;b&amp;gt;(.*)&amp;lt;\/b&amp;gt;/g, '<b>$1</b>')
    .replace(/&amp;lt;i&amp;gt;(.*)&amp;lt;\/i&amp;gt;/g, '<i>$1</i>')
    .replace(/&amp;lt;u&amp;gt;(.*)&amp;lt;\/u&amp;gt;/g, '<u>$1</u>')
    .replace(/&amp;lt;del&amp;gt;(.*)&amp;lt;\/del&amp;gt;/g, '<del>$1</del>')
    .replace(/&amp;lt;code&amp;gt;(.*)&amp;lt;\/code&amp;gt;/g, '<code>$1</code>')
    .replace(/&amp;lt;pre&amp;gt;(.*)&amp;lt;\/pre&amp;gt;/g, '<pre>$1</pre>')
    .replace(/&amp;lt;br&amp;gt;/g, '<br>')
    .replace(
      new RegExp(`&amp;lt;${link}&amp;gt;(&#|\\s|$)`, 'g'),
      (_, a, b, c) => `<a target=_blank rel=noreferrer href="${a ?? "http://"}${b}">${b}</a>${c}`)
    .replace(
      new RegExp(`\\b${link}(&#|\\s|$)`, 'g'),
      (_, a, b, c) => `<a target=_blank rel=noreferrer href="${a ?? "http://"}${b}">${b}</a>${c}`)
    .replace(
      new RegExp(`\\b(${proto}([^ <>&]+))(&#|\\s|$)`, 'g'),
      '<a target=_blank rel=noreferrer href="$1">$2</a>$3')
    .replaceAll('&#32;', ' ')
    .replaceAll('&amp;quot;', '&quot;')
    .replaceAll('&amp;gt;', '&gt;')
    .replaceAll('&amp;lt;', '&lt;')
    .replaceAll('&amp;amp;', '&amp;')
    ;
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

const round = (n, mod) => Math.trunc(n / mod) * mod;

const getCloakColor = (cloak) => {
  const hash = Array.from(cloak)
    .reduce(
      (a,x) => ((a << 4) ^ (a >> 8) ^ x.charCodeAt(0)) & 0xfff,
      cloak.length);
  const color = 0x808080 | ((hash & 0x00f) << 3) | ((hash & 0x0f0) << 7) | ((hash & 0xf00) << 11);
  return `#${color.toString(16)}`;
};

const emojiRegexp =
  /[\u{10000}-\u{100FA}\u{10600}-\u{10767}\u{101D0}-\u{101FC}\u{10980}-\u{1099F}\u{13000}-\u{16A38}\u{1F000}-\u{1FAFF}\p{Extended_Pictographic}\p{Regional_Indicator}]|[^\P{Pattern_Syntax}\p{Diacritic}\p{Radical}\p{ASCII}]|[^\P{Changes_When_NFKC_Casefolded}\p{Alphabetic}\p{Math}\p{Diacritic}\p{Radical}\p{ASCII}]/ug;
const notEmojis = '…“”‘’▪―─—°„– ️«»《》‍  ​';
const notEmojiRegexp = /[\P{Assigned}]/ug;

const isNonEmoji = (c) => notEmojiRegexp.test(c) || notEmojis.indexOf(c) >= 0;

const initEmojiPicker = () => {
  const div = document.getElementById('js-emoji');
  if (!div) {
    return;
  }

  div.id = 'js-emoji-done';
  setTimeout(() => {
    fillAllEmoji(div);
    const toggle = document.getElementById('show_emoji');
    toggle.onclick = () => document.documentElement.classList.add('js-emoji-selector');
    toggle.disabled = false;
  }, 100);
};

const fillAllEmoji = (div) => {
  let emoji = '';
  let last;
  for (let i = 0; i < 0x20000; i++) {
    const char = String.fromCodePoint(i);
    if (!isNonEmoji(char) && emojiRegexp.test(char)) {
      if (last && (i !== last + 1)) {
        emoji += '<span>&nbsp;</span> ';
      }
      emoji += `<span data-char="${char}">${char}</span> `;
      last = i;
    }
  }
  div.innerHTML = emoji;

  document.querySelectorAll('#emoji span').forEach((span) => {
    span.onclick = (e) => {
      const text = document.getElementById('message')
      text.value += span.textContent;
      document.documentElement.classList.remove('js-emoji-selector');
      text.focus();
    };
  });
};

const normalizeEnteredText = (s) => {
  return s.replaceAll('\n', '<br>').replace(/\s+/g, ' ').trim();
};

const onSubmit = (e) => {
  e.preventDefault();
  const error = document.getElementById('error');
  error.hidden = true;
  const message = document.getElementById('message');
  message.disabled = true;
  const text = normalizeEnteredText(message.value);
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
