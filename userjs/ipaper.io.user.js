// ==UserScript==
// @name        viewer.ipaper.io noJS content JSON display
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://viewer.ipaper.io/*
// @grant       none
// @version     2022.12.1
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
  addTitleDescription(result);
  addJson(result);
  document.body.appendChild(result);

  addStyle();
}

function addStyle() {
  const style = document.createElement('style');
  style.textContent = `
    pre { white-space: pre-wrap; overflow-x: auto; }
    body, html { overflow: initial; }
    #preloaderLogoContainer, .l-app { display: none; }
  `;
  document.head.appendChild(style);
}

function addJson(result) {
  const code = document.createElement('pre');
  const json = getJson();
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    addDownload(result, json);
    code.textContent = JSON.stringify(json, null, 2);
  }

  result.appendChild(code);
}

function addDownload(result, json) {
  if (!json.url ||!json.name) {
    return;
  }

  const a = document.createElement('a');
  a.innerHTML = json.name;
  a.download = a.textContent.replaceAll(' ', '_') + '.pdf';
  a.referrerPolicy = 'no-referrer';
  a.rel = 'noreferrer';
  a.target = '_blank';
  a.href = json.url + 'GetPDF.ashx';
  result.appendChild(a);
}

function addTitleDescription(result) {
  const title = document.head.getElementsByTagName('title')[0];
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent;
    result.appendChild(h1);
  }

  const meta = document.head.querySelector('meta[property="og:description"]');
  if (meta) {
    const cite = document.createElement('blockquote');
    cite.textContent = meta.content;
    result.appendChild(cite);
  }
}

function getJson() {
  const scripts = document.getElementsByTagName('script');
  const prefix = "window.staticSettings =";

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
    .replace(/;window[.]dataStore = [{]".*$/g, '');

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}

main();
})();
