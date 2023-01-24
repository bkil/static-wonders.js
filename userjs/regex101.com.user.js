// ==UserScript==
// @name        regex101.com noJS view source
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://*regex101.com/*
// @grant       none
// @version     2023.01.01
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
  const result = document.querySelector('[style="width:nullpx"] button + div') ?? document.body;
  result.textContent = '';
  result.style.overflow = 'auto';
  addJson(result);
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
  const {regex, testString} =  json.regexEditor;
  r.value = regex;
  t.value = testString;
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

  try {
    return JSON.parse(unescape(s));
  } catch (e) {
    return `${e}\n${s}`;
  }
};

const addStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    html {
      overflow-wrap: break-word;
    }

    pre {
      white-space: pre-wrap;
      overflow-x: auto;
      font-family: monospace;
    }

    /* reveal textbox contents */
    .CodeMirror-show-whitespace > textarea {
      display: initial !important;
      min-width: 100%;
      min-height: 100%;
    }

    /* hide loader */
    #regex-app > :first-child {
      display: none;
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
