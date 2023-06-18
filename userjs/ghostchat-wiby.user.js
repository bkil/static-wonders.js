// ==UserScript==
// @name        chat.wiby JS
// @author      bkil
// @description Frugal AJAX UserScript & bookmarklet web app with many small features: rich text, textbox composer, character count, dark mode, configurable polling, LocalStorage log, emoji, notifications, hash-based name & mention coloring, local user ban, quality of life settings. Not ES5 (Opera Mini) compatible yet.
// @namespace   bkil.hu
// @match       https://wiby.me/chat/
// @grant       none
// @version     2023.5.22
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
const title = 'GhostChat-JS';
let nextUpdateTime;
let state;
let openNotification;
let notificationSent;

const init = () => {
  if ((window.location.hostname !== 'wiby.me') && ((window.location.hostname !== 'localhost'))) {
    window.location = 'https://wiby.me/chat/#click_bookmarklet_again';
    return;
  }
  if (document.documentElement) {
    document.documentElement.remove();
  }
  const doc = document.createElement('html');
  document.appendChild(doc);

  doc.innerHTML = `
    <head>
    <meta charset=utf-8>
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
        border-left: 1px solid;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        vertical-align: top;
      }

      td.timestamp {
        border-color: white;
      }

      .ignored .comment {
        font-size: 0;
        text-align: right;
      }

      .ignored .comment::after {
        font-size: xx-small;
        color: #777;
        content: 'hidden';
      }

      .meta td {
        padding: 0.5em;
        font-style: italic;
      }

      .meta td,
      .day td {
        border-left: initial;
        border-top: 1px solid;
      }

      .day td {
        border-bottom: 1px solid;
        opacity: 0.7;
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

      pre {
        max-width: 100%;
        white-space: pre-wrap;
        margin: 1em;
        padding: 1em;
      }

      code {
        display: inline-block;
        margin: 0.5em;
        padding: 0.5em;
      }

      pre, code {
        background-color: #211;
      }

      .timestamp {
        white-space: nowrap;
        text-align: right;
      }

      .isMyCloak {
        font-weight: bold;
        text-decoration: underline;
      }

      .isMentionMe {
        text-decoration: underline;
        background-color: #400;
      }

      .isFirstPing .cloak,
      .isFirstPing .timestamp {
        background-color: #611;
      }

      .cloak {
        font-family: monospace;
        border-top: 1px solid white;
      }

      .cloak:not(.isMyCloak) {
        cursor: pointer;
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

      #settings label:not(.inline),
      #settings input:not([type="checkbox"]) {
        display: block;
        width: 100%;
      }

      html.js-settings #log,
      html.js-settings form,
      html:not(.js-settings) #settings,
      html.unlimited #set_inactive,
      html.isPassive #log,
      html.isPassive form > :not(#set_active):not(#inactive):not(#status),
      html:not(.isPassive) #inactive,
      html:not(.isPassive) #set_active {
        display: none;
      }

    </style>
    </head>

    <body>
    <div id=foreground>
      <div id=log></div>
      <div id=settings>
        <label class=inline for=notification>Notification</label>
        <select id=notification>
          <option value=0>None</option>
          <option value=1>Mentions</option>
          <option value=2>All posts</option>
        </select>
        <label for=min_poll>Min sync interval</label><input id=min_poll>
        <label for=max_poll>Max sync interval</label><input id=max_poll>
        <label for=min_hour>First chat hour</label><input id=min_hour>
        <label for=max_hour>Last chat hour</label><input id=max_hour>
        <button id=close_settings type=button>Resume chat</button>
        <button id=set_inactive type=button>Go to sleep immediately</button>
      </div>
      <form method=POST action=#>
        <div id=inactive>Time to live your life</div>
        <textarea disabled name=message id=message maxlength=180 rows=2 columns=90></textarea>
        <input id=send type=submit data-value_refresh='Refresh (sh+enter)' data-value_post='Post (sh+enter)' accesskey=p>
        <button disabled id=show_emoji type=button>Emoji</button>
        <button id=show_settings type=button>Settings</button>
        <button id=set_active type=button>Resume doom scrolling for a bit</button>
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
  askPermissionNotif();
  updateTitle();

  const messageBox = document.getElementById('message');
  messageBox.value = state.textbox ?? '';
  updateCounter();
  messageBox.oninput = updateCounter;
  messageBox.disabled = false;
  document.getElementById('send').scrollIntoView();
  messageBox.focus();

  document.onvisibilitychange = messageBox.onfocus = function(e) {
    if (!document.hidden) {
      state.pendingPing = null;
      updateTitle();
      notificationSent = false;
    }
  };

  document.getElementById('set_inactive').onclick = function(e) {
    state.activeUntil = null;
    const now = new Date();
    if (isActiveNow(now)) {
      state.inactiveUntil = +now + (25 + state.maxActiveHour - now.getHours()) % 24 * 3600e3;
    } else {
      state.inactiveUntil = null;
    }
    inactivate();
    saveSettings();
  };

  document.getElementById('set_active').onclick = function(e) {
    state.activeUntil = +new Date() + 600e3;
    activate();
    console.log(state);
    saveState();
    updateFeed();
  };

  document.getElementById('show_settings').onclick = function(e) {
    if ((state.minActiveHour >= 0) && (24 > state.maxActiveHour)) {
      document.documentElement.classList.remove('unlimited');
    } else {
      document.documentElement.classList.add('unlimited');
    }

    forEach(document.getElementById('notification').getElementsByTagName('option'), function(o) {
      o.selected = o.value === (state.notification.toString());
    });
    document.getElementById('min_poll').value = state.pollMinSecond;
    document.getElementById('max_poll').value = state.pollMaxSecond;
    document.getElementById('min_hour').value = state.minActiveHour;
    document.getElementById('max_hour').value = state.maxActiveHour;
    document.documentElement.classList.add('js-settings');
  };

  document.getElementById('close_settings').onclick = function(e) {
    saveSettings();
    document.getElementById('send').scrollIntoView();
    document.getElementById('message').focus();
  };

  document.forms[0].onsubmit = onSubmit;
  messageBox.onkeypress = e => {
    if ((e.key === 'Enter') && (e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      document.forms[0].requestSubmit();
    }
  };
  updateFeed();
};

function saveSettings() {
  forEach(document.getElementById('notification').getElementsByTagName('option'), function(o) {
    if (o.selected) {
      state.notification = parseInt(o.value);
    }
  });
  askPermissionNotif();

  var k;
  k = parseInt(document.getElementById('min_poll').value);
  state.pollMinSecond = (k >= 38) ? ((600 >= k) ? k : 600) : 38;

  k = parseInt(document.getElementById('max_poll').value);
  state.pollMaxSecond = (k >= state.pollMinSecond) ? ((600 >= k) ? k : 600) : state.pollMinSecond;

  k = parseInt(document.getElementById('min_hour').value);
  state.minActiveHour = (k >= 0) ? ((24 >= k) ? k : 24) : 0;

  k = parseInt(document.getElementById('max_hour').value);
  state.maxActiveHour = (k >= 0) ? ((24 >= k) ? k : 24) : 24;

  console.log(state);
  saveState();
  document.documentElement.classList.remove('js-settings');
}

function forEach(l, f) {
  for (var i = 0; i < l.length; i++) {
    f(l[i], i);
  }
}

function askPermissionNotif() {
  if (!state.notification || window.Notification && (Notification.permission === 'granted')) {
    return;
  }
  var wantedNotif = state.notification;
  state.notification = 0;
  saveState();
  if ((window.self === window.top) && window.Notification && (Notification.permission !== 'denied')) {
    Notification.requestPermission(function() {
      if (Notification.permission === 'granted') {
        state.notification = wantedNotif;
        saveState();
      }
    });
  }
}

const updateCounter = () => {
  const text = normalizeEnteredText(document.getElementById('message').value);
  const len = text.length;
  const counter = document.getElementById('counter');
  const submit = document.getElementById('send');
  if (len) {
    counter.textContent = len + (escapeWibyHTML(text).length > 71 ? '+' : '');
    submit.value = submit.dataset.value_post;
  } else {
    counter.textContent =  '';
    submit.value = submit.dataset.value_refresh;
    updatePlaceholder();
  }
};

const updatePlaceholder = () => {
  const message = document.getElementById('message');
  if (!message.length) {
    if (2*(+new Date() - state.postedTime) < state.pollMaxSecond) {
      message.placeholder = 'Wait before posting messages in a row';
    } else {
      message.placeholder = 'Post <180 char once instead of short lines.';
    }
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
  } else {
    state = {};
  }
  migrateDb();
};

const migrateDb = () => {
  if (typeof state.version !== 'number') {
    state.key = {};
    state.log = [];
    state.myCloaks = [];
    state.postedMessage = null;
    state.postedTime = null;
    state.zone = null;
    state.lastCloak = null;
    state.textbox = null;
    state.myCloaks = [];
    state.lastModified = null;
    state.version = 0;
  }

  if (state.version === 0) {
    state.pollMinSecond = 38;
    state.pollMaxSecond = 600;
    state.pollSecond = state.pollMinSecond;
    state.version = 1;
  }

  if (state.version === 1) {
    state.minActiveHour = 0;
    state.maxActiveHour = 24;
    state.notification = 1;
    state.activeUntil = null;
    state.inactiveUntil = null;
    state.pendingPing = null;
    state.version = 2;
  }

  if (state.version === 2) {
    if (state.notification) {
      state.notification = 2;
    }
    state.version = 3;
  }

  if (state.version === 3) {
    state.ignoredUser = {};
    state.version = 4;
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
  updateStatePosts(body, now);

  let isActive = isActiveNow(now);
  if (state.inactiveUntil && (state.inactiveUntil > +now)) {
    isActive = false;
  } else {
    state.inactiveUntil = null;
  }
  if (state.activeUntil && (state.activeUntil > +now)) {
    isActive = true;
  } else {
    state.activeUntil = null;
  }

  if (isActive) {
    activate();
    const isFocused = (!document.hasFocus || document.hasFocus()) && (!document.hidden);
    if (!notificationSent && state.notification && state.pendingPing && !isFocused) {
      console.log('notification ' + new Date());
      openNotification = new Notification(
        '💬 Wiby ' + ((state.notification === 1) ? 'mention' : 'post'),
        {
          body: new Date(state.pendingPing).toLocaleString()
        });
      notificationSent = true;
    }
    renderLog();
    if (state.pendingPing && isFocused) {
      if (openNotification) {
        openNotification.close();
      }
      state.pendingPing = null;
      updateTitle();
      notificationSent = false;
    }
  } else {
    inactivate();
  }
  console.log(state);

  document.getElementById('status').textContent = now.toLocaleTimeString();
  const messageBox = document.getElementById('message');
  document.getElementById('send').scrollIntoView();
  updatePlaceholder();
  messageBox.focus();
  scheduleUpdate();
};

const updateStatePosts = (body, now) => {
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
  let foundSeenLine = false;
  while (--i >= 0) {
    const [hours, mins, cloak, message] = lines[i];
    const hhmm = `${hours}:${mins}`;
    const hour = parseInt(hours);
    const min = parseInt(mins);
    const key = `${hhmm}\n${cloak}\n${message}`;
    if (state.key[key] !== undefined) {
      foundSeenLine = true;
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
    if (!foundSeenLine) {
      state.log.push({meta: 'missingLines'});
    }
    resetPollDelay();
  } else {
    increasePollDelay();
  }

  updates.reverse().forEach(u => {
    if (!state.pendingPing && !u.isMe && (isMessagePing(u) || (state.notification === 2))) {
      state.pendingPing = u.time;
    }
    const key = `${u.hhmm}\n${u.cloak}\n${u.message}`;
    state.key[key] = state.log.length;
    state.log.push(u);
  });
};

function updateTitle(silence) {
  document.title = (silence ? '' : state.pendingPing ? '(!)' : '.') + title;
}

function isActiveNow(now) {
  const hour = now.getHours();
  return (
    ((hour >= state.minActiveHour) && (state.maxActiveHour >= hour) || (state.minActiveHour > state.maxActiveHour)) &&
    ((hour >= state.minActiveHour) || (state.maxActiveHour >= hour) || (state.maxActiveHour >= state.minActiveHour))
  );
}

function activate() {
  updateTitle();
  document.documentElement.classList.remove('isPassive');
}

function inactivate() {
  updateTitle(true);
  document.documentElement.classList.add('isPassive');
}

function isMessagePing(m) {
  return m.isMentionMe;
}

const renderLog = () => {
  const allSeenCloaks = new Set();
  let lastLineCloak;
  let lastLineMe;
  let lastDay;
  const tab = document.createElement('table');
  let isShownPing = false;
  state.log.forEach(u => {
    let tr = tab.insertRow();
    if (u.meta) {
      tr.classList.add('meta');
      const td = tr.insertCell();
      td.colSpan = 3;
      if (u.meta === 'missingLines') {
        td.classList.add('missing_lines');
        td.textContent = '(log lines may be missing)';
      } else {
        td.textContent = meta;
      }
      lastDay = null;
    } else {
      if (!isShownPing && (state.pendingPing === u.time)) {
        tr.classList.add('isFirstPing');
        isShownPing = true;
      }

      const time = new Date(u.time);
      const day = time.toLocaleDateString();
      if (day !== lastDay) {
        tr.classList.add('day');
        const td = tr.insertCell();
        td.colSpan = 3;
        td.textContent = day;

        tr = tab.insertRow();
      }

      if (state.ignoredUser[u.cloak]) {
        tr.classList.add('ignored');
      }
      const cloak = tr.insertCell();
      if ((u.cloak !== lastLineCloak) || (u.isMe !== lastLineMe) || (day !== lastDay)) {
        cloak.textContent = u.cloak;
        cloak.classList.add('cloak');
        if (u.isMe) {
          cloak.classList.add('isMyCloak');
        } else if (state.ignoredUser[u.cloak]) {
          cloak.title = 'click to unban';
          cloak.onclick = function() {
            delete state.ignoredUser[u.cloak];
            saveState();
            renderLog();
          };
        } else {
          cloak.title = 'click to ban';
          cloak.onclick = function() {
            if (confirm('Hide all posts of ' + u.cloak + '?')) {
              state.ignoredUser[u.cloak] = u.time;
              saveState();
              renderLog();
            }
          };
        }
        allSeenCloaks.add(u.cloak);

        lastLineCloak = u.cloak;
        lastLineMe = u.isMe;
      }
      cloak.style.color = getCloakColor(u.cloak);

      const stamp = tr.insertCell();
      stamp.textContent = time.toLocaleTimeString().replace(':00 ', ' ');
      stamp.classList.add('timestamp');
      if (isMessagePing(u)) {
        stamp.classList.add('isMentionMe');
      }

      const comment = tr.insertCell();
      comment.classList.add('comment');
      let colored = escapeHTML(u.message);
      allSeenCloaks.forEach(cl => {
        const color = getCloakColor(cl);
        colored = colored.replace(
          new RegExp(`((?:@ ?)?\\b${cl}\\b)([\[{\(</:&.,;!? ]|$)`, 'g'),
          (_, a, b) => `<span style="color:${color}">${a}</span>${b}`)
      });
      comment.innerHTML = markup(colored);

      lastDay = day;
    }
  });

  const cont = document.getElementById('log');
  cont.innerHTML = '';
  cont.appendChild(tab);
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
  const sw = `(^|\\s|;)`;
  const ew = `([;:,.!?<)-]?(?:&#|&amp|\s|$))`;
  const wordReg = (middle) => new RegExp(`${sw}${middle}${ew}`, 'g');
  return s
    .replaceAll(' ', '&#32;')
    .replace(wordReg('__([^_<>]*)__'), '$1<u>$2</u>$3')
    .replace(wordReg('_([^_<>]*)_'), '$1<em>$2</em>$3')
    .replace(wordReg('[*][*]([^*<>]*)[*][*]'), '$1<strong>$2</strong>$3')
    .replace(wordReg('[*]([^*<>]*)[*]'), '$1<em>$2</em>$3')
    .replace(wordReg('~~([^~<>]*)~~'), '$1<del>$2</del>$3')
    .replace(wordReg('`([^`<>]*)`'), '$1<code>$2</code>$3')
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
  const hash = cloak ? Array.from(cloak)
    .reduce(
      (a,x) => ((a << 4) ^ (a >> 8) ^ x.charCodeAt(0)) & 0xfff,
      cloak.length) : 0;
  return `hsl(${(hash & 31) * 11.25},${75 + (hash & 0xe0) * 0.1116}%,${50 + hash * 0.0061}%)`;
};

const emojiRegexp =
  /[\u{10000}-\u{100FA}\u{10600}-\u{10767}\u{101D0}-\u{101FC}\u{10980}-\u{1099F}\u{13000}-\u{16A38}\u{1F000}-\u{1FAFF}\p{Extended_Pictographic}\p{Regional_Indicator}]|[^\P{Pattern_Syntax}\p{Diacritic}\p{Radical}\p{ASCII}]|[^\P{Changes_When_NFKC_Casefolded}\p{Alphabetic}\p{Math}\p{Diacritic}\p{Radical}\p{ASCII}]/ug;
const notEmojis = '…“”‘’▪―─—°„– ️«»《》‍  ​';
const notEmojiRegexp = /[\P{Assigned}]/ug;

const isNonEmoji = (c) => notEmojiRegexp.test(c) || (notEmojis.indexOf(c) >= 0);

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
      updateCounter();
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
