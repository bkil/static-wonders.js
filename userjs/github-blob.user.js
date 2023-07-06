// ==UserScript==
// @name        github.com raw blob noJS
// @author      bkil
// @description Minimal viewer of files on GitHub
// @namespace   bkil.hu
// @match       https://github.com/*/blob/*
// @grant       none
// @version     2023.7.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function init() {
  var res = document.querySelector('[app-name="react-code-view"]')
  if (!res) {
    return
  }
  var script = res.querySelector('script[data-target="react-app.embeddedData"]');
  if (!script) {
    return
  }

  var j;
  try {
    j = JSON.parse(script.textContent);
  } catch (err) {
    console.log(err);
    return
  }

  if (j && j.payload && j.payload.blob && j.payload.blob.rawBlob) {
    res.appendChild(getPre(j.payload.blob.rawBlob));
  }

  var details = document.createElement('details');
  var summary = document.createElement('summary');
  summary.textContent = 'Click to debug JSON';
  details.appendChild(summary);
  details.appendChild(getPre(JSON.stringify(j, null, 2)));
  res.appendChild(details);
}

function getPre(text) {
  var pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.wordWrap = 'anywhere';
  pre.style.overflowWrap = 'anywhere';
  pre.textContent = text;
  return pre;
}

init();
})();
