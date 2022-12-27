// ==UserScript==
// @name        jsfiddle.net noJS view source
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://jsfiddle.net/*
// @grant       none
// @version     2022.12.20
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function main() {
  const result = document.createElement('div');
  addJson(result);
  document.body.appendChild(result);
  addStyle();
}

function addStyle() {
  const style = document.createElement('style');
  style.textContent = `
    pre {
      white-space: pre-wrap;
      overflow-x: auto;
      margin: 1em;
    }

    h2 {
      font-size: initial;
      font-weight: initial;
    }

    /* hide form with loader, sidebar and empty space  */
    #show-result {
        display: none;
    }

    body {
        /* restore text contrast */
        background: initial;
        /* make 404 page visible */
        color: initial;
    }
  `;
  document.head.appendChild(style);
}

function addJson(result) {
  const code = document.createElement('pre');
  const json = getJson();
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    addRendered(result, json);
    code.textContent = JSON.stringify(json, null, 2);
  }
  result.appendChild(code);
}

function addRendered(result, json) {
  if (!json.value || !json.value.html || !json.value.css || !json.value.js) {
    return;
  }

  const html = json.value.html;
  const css = json.value.css;
  const js = json.value.js;
  const a = document.createElement('a');
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.href = `https://bkil.gitlab.io/static-wonders.js/jump/iframe-js-sandbox.html#html=${encodeURIComponent(html)}&css=${encodeURIComponent(css)}&js=${encodeURIComponent(js)}`;
  a.textContent = 'Open preview';
  result.appendChild(a);

  addPre(result, html, 'html');
  addPre(result, css, 'css');
  addPre(result, js, 'js');
}

function addPre(result, content, title) {
  const div = document.createElement('div');
  div.className = title;

  const h = document.createElement('h2');
  h.textContent = title;
  div.appendChild(h);

  const pre = document.createElement('pre');
  pre.innerText = content;
  div.appendChild(pre);

  const hr = document.createElement('hr');
  div.appendChild(hr);
  result.appendChild(div);
}

function getJson() {
  const scripts = document.getElementsByTagName('script');
  const prefix = '\n      var EditorConfig = ';

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
    .substr(prefixPos + prefix.length)
    .replace(/\n *const \w+ = [{](.|\n)*$/, '')
    .replace(/\n *\/\/[^\n]*/g, '')
    .replace(/\n *([^ "]+):/g, '"$1":')
    .replace(/\\([`$'])/g, '$1')
    .replace(/\t/g, '\\t')
    ;

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}
getJson();

main();
})();
