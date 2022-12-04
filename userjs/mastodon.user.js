// ==UserScript==
// @name        Mastodon-Pleroma noJS reveal
// @author      bkil
// @description Preview without extra round trips
// @namespace   bkil.hu
// @match       https://*.*/notice/*
// @match       https://*.*/@*/*
// @grant       none
// @version     2022.12.01
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
  const sites = /^\/(notice\/[0-9A-Za-z]{18}|@[^\/]+\/[0-9]+)$/;
  if (window.location.hash || window.location.search || !window.location.pathname.match(sites)) {
    return
  }

  const result = document.createElement('div');
  addTitleDescription(result);
  document.body.prepend(result);
  addStyle();
}

function addTitleDescription(result) {
  let el = document.createElement('h1');
  el.textContent = document.head.getElementsByTagName('title')[0]?.textContent;
  result.appendChild(el);

  el = document.createElement('p');
  el.innerText = document.head.querySelector('meta[property="og:description"]')?.content;
  result.appendChild(el);

  const alt = document.head.querySelector('meta[property="og:image:alt"]')?.content;

  const img = document.head.querySelector('meta[property="og:image"]')?.content;
  if (img) {
    el = document.createElement('img');
    el.src = img;
    if (alt) {
      el.alt = alt;
    }

    const width = document.head.querySelector('meta[property="og:image:width"]')?.content;
    if (width) {
      el.width = width;
    }

    const height = document.head.querySelector('meta[property="og:image:height"]')?.content;
    if (height) {
      el.height = height;
    }

    result.appendChild(el);
  }

  el = document.createElement('blockquote');
  el.textContent = alt;
  result.appendChild(el);
}

function addStyle() {
  const style = document.createElement('style');
  const nonce = document.head.querySelector('meta[name="style-nonce"]')?.content;
  if (nonce) {
    style.nonce = nonce;
  }

  style.textContent = `
    h1 { font: initial; font-size: 2em }
    img { max-width: 100%; font-size: xx-small }
    blockquote { border-left: 1px solid; padding-left: 1em }
    `;
  document.body.appendChild(style);
}

})();
