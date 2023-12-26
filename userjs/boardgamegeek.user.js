// ==UserScript==
// @name        boardgamegeek.com noJS content JSON display
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://boardgamegeek.com/*
// @grant       none
// @version     2023.12.1
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
  addTitleDescription(result);
  addJson(result);
  document.body.appendChild(result);

  addStyle();
}

function addStyle() {
  const style = document.createElement('style');
  style.innerText =
    'pre { white-space: pre-wrap; overflow-x: auto; }' +
    '[ng-cloak] { display: initial !important; }' +
    '.min-vh-100 { min-height: initial; }'
  ;
  document.body.appendChild(style);
}

function addJson(result) {
  const code = document.createElement('pre');
  const json = getJson();
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    code.innerText = JSON.stringify(json, null, 2);
    const fields = document.createElement('div');
    addFields(fields, json);
    result.appendChild(fields);
  }

  result.appendChild(code);
}

function addFields(result, json) {
  let a = json['geekitemPreload'];
  if (a) {
    a = a['item'];
    if (a) {
      a = a['description'];
      if (a) {
        const doc = document.createElement('div');
        doc.innerHTML = a;
        result.appendChild(doc);
      }
    }
  }
}

function addTitleDescription(result) {
  const title = document.head.getElementsByTagName('title')[0];
  if (title) {
    const h1 = document.createElement('h1');
    h1.innerText = title.innerText;
    result.appendChild(h1);
  }

  const meta = document.head.querySelector('meta[property="og:description"]');
  if (meta) {
    const cite = document.createElement('blockquote');
    cite.innerText = meta.content;
    result.appendChild(cite);
  }
}

function getJson() {
  const scripts = document.getElementsByTagName('script');
  const prefix = "\n\tvar GEEK = GEEK || {};\n\t";

  let script = '';
  let prefixPos = -1;
  for (let i = 0; (i < scripts.length) && (prefixPos !== 0); i++) {
    script = scripts[i].text;
    prefixPos = script.indexOf(prefix);
  }
  if (prefixPos !== 0) {
    return '';
  }

  const line = '{' + script
    .substr(prefixPos + prefix.length)
    .replace(/^GEEK\.([a-zA-Z0-9_]+) = /, '"$1":')
    .replace(/(;\s*GEEK\.([a-zA-Z0-9_]+) = )'([^']*)'/g, '$1"$2"')
    .replace(/;\s*GEEK\.([a-zA-Z0-9_]+) = /g, ',"$1":')
    .replace(/\n\s*'([^']*)'\s*:\s*'([^']*)'(,?)/g, '"$1":"$2"$3')
    .replace(/,(\s*\n\s*})/, '$1')
    .replace(/;\n$/g, '}')
    ;

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}
})();
