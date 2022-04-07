// ==UserScript==
// @name        Diaspora noJS content JSON display
// @author      bkil
// @description -
// @namespace   bkil.hu
// @match       https://diasp.org/*
// @match       https://despora.de/*
// @match       https://diasp.eu/*
// @match       https://diaspora.psyco.fr/*
// @grant       none
// @version     2022.4.6
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @run-at      document-start
// @noframes
// ==/UserScript==

(function() {
'use strict';
main();

function main() {
  if ('loading' === document.readyState) {
    document.addEventListener('readystatechange', later);
  } else {
    later();
  }
}

function later() {
  if ('loading' === document.readyState) {
    return
  }
  document.removeEventListener('readystatechange', later);
  stopUnneededResources();
  changeStyle();

  const result = document.createElement('div');
  addTitleDescription(result);
  addJson(result);
  document.body.appendChild(result);
}

function stopUnneededResources() {
  fixHead();

  const tags = Array.from(document.getElementsByTagName('img'));
  for (const tag of tags) {
    tag.parentElement.removeChild(tag);
  }
}

function fixHead() {
  const tags = Array.from(document.head.getElementsByTagName('link'));
  for (const tag of tags) {
    tag.parentElement.removeChild(tag);
  }

  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', "style-src 'unsafe-inline'");
  document.head.appendChild(meta);

  const ico = document.createElement('link');
  ico.rel = 'shortcut icon';
  ico.type = 'image/x-icon';
  ico.href = 'data:image/x-icon;,';
  document.head.appendChild(ico);
}

function changeStyle() {
  const style = document.createElement('style');
  style.innerText =
    'pre { white-space: pre-wrap; overflow-x: auto; }' +
    'a.navbar-brand > img { display: none; }'
  ;
  document.head.appendChild(style);
}

function addJson(result) {
  const code = document.createElement('pre');
  const json = getJson();
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    code.innerText = JSON.stringify(json, null, 2);
  }

  result.appendChild(code);
}

function addTitleDescription(result) {
  const title = document.head.getElementsByTagName('title')[0];
  if (title) {
    const h1 = document.createElement('h1');
    h1.innerText = title.innerText.trim();
    result.appendChild(h1);
  }

  const desc = document.head.querySelector('meta[property="og:description"]');
  if (desc) {
    const cite = document.createElement('blockquote');
    cite.innerText = desc.content;
    result.appendChild(cite);
  }

  const image = document.head.querySelector('meta[property="og:image"]');
  if (image) {
    const img = document.createElement('img');
    img.src = image.content;
    result.appendChild(img);
  }
}

function getJson() {
  const scripts = document.getElementsByTagName('script');
  const prefix = "\n//<![CDATA[\nwindow.gon={};";

  let script = '';
  let prefixPos = -1;
  for (let i = 0; (i < scripts.length) && (prefixPos !== 0); i++) {
    script = scripts[i].text;
    prefixPos = script.indexOf(prefix);
  }
  if (prefixPos !== 0) {
    return '';
  }

  let line = '{' + script
    .substr(prefixPos + prefix.length)
    .replace(/^gon\.([a-zA-Z0-9_]+)=/, '"$1":')
    .replace(/;gon\.([a-zA-Z0-9_]+)=/g, ',"$1":')
    .replace(/;\n\/\/\]\]>\n$/g, '}');

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}
})();
