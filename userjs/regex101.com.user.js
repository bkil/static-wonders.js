// ==UserScript==
// @name        regex101.com noJS view source
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://*regex101.com/*
// @grant       none
// @version     2023.02.01
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
  let result = document.querySelector('[style="width:nullpx"] button + div');
  if (result) {
    result.textContent = '';
    result.style.overflow = 'auto';
  } else {
    result = document.createElement('div');
    document.body.appendChild(result);
  }
  addJson(result);

  const panel = document.querySelector('header + div + div > div + div[style="display:none"] > div');
  if (panel) {
    panel.onclick = e => {
      panel.hidden = true;
    };
  }
}

const addJson = (result) => {
  const code = document.createElement('pre');
  result.appendChild(code);
  const json = readJson();
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    code.textContent = JSON.stringify(json, null, 2);
    addRendered(json);
  }
}

const addRendered = (json) => {
  const [r, t] = document.querySelectorAll('.CodeMirror-show-whitespace > textarea');
  if (t) {
    const {regex, testString} =  json.regexEditor;
    r.value = regex;
    t.value = testString;
    return;
  }

  const desc = document.querySelector('h2 + div > div > div[aria-label="Loading..."] + div');
  if (desc && desc.textContent === 'Loading markdown...') {
    desc.style.textAlign = 'initial';
    const details = json.regexLibrary?.details;
    desc.textContent = `${details?.description}\n${details?.dateModified}`;
    return;
  }
};

const readJson = () => {
  const r = /^\s+window.__INITIAL_STATE__ = \s*'/;
  const s =
    Array.from(document.querySelectorAll('script'))
      .find(s => r.test(s.textContent))
      ?.textContent.replace(r, '')
      .replace(/';\s*$/g, '');

  if (!s) {
    return `${r}\nnot found`;
  }

  const us = unescape(s.replaceAll("\\'", "'").replaceAll('\\\\', '\\'));

  try {
    return JSON.parse(us);
  } catch (e) {
    return `${e}\n${us}`;
  }
};

const addStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    html {
      overflow-wrap: break-word;
      overflow: initial;
    }

    body {
      overflow: initial !important;
    }

    pre {
      white-space: pre-wrap;
      font-family: monospace;
    }

    /* reveal textbox contents on /r/ */
    .CodeMirror-show-whitespace > textarea {
      display: initial !important;
      min-width: 100%;
      min-height: 100%;
    }

    header + div + div > div + div[style="display:none"] {
      /* reveal textbox on /library/ */
      display: initial !important;
      /* show a bit more teaser in the background on /library/ */
      --bg-1: initial;
    }

    /* hide loader */
    #regex-app > :first-child {
      display: none;
    }

    /* hide loader on /library/ */
    div[aria-label="Loading..."] {
      display: none;
    }

    #regex-app header + div > div + div > div + div + div > div::before {
      content: initial;
    }

    #regex-app header + div > div + div > div + div + div > div + div > div::before {
      content: initial;
    }

    /* expand JSON on the side */
    [style="width:nullpx"] > div {
      flex: initial;
      flex-basis: initial;
    }
  `;
  document.head.appendChild(style);
}

main();
})();
