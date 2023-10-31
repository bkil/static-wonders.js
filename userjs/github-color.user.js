// ==UserScript==
// @name        VCS header color per project
// @author      bkil
// @description Pick a random color based on the project URL prefix and colour the top header. Currently supported: GitHub, GitLab, Codeberg
// @namespace   bkil.hu
// @match       https://github.com/*
// @match       https://gitlab.com/*
// @match       https://codeberg.org/*
// @grant       none
// @version     2023.10.3
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function adler32(text) {
  var s1 = 1;
  var s2 = 0;
  var i = 0;
  while (i < text.length) {
    s1 = (s1 + text.charCodeAt(i)) % 65521;
    s2 = (s2 + s1) % 65521;
    i = i + 1;
  }
  return (s2 << 16) | s1;
}

function getHashColor(text) {
  var hash = adler32(text);
  var h = 0;
  var s = 0;
  var l = 0;
  var i = 0;
  while (i < 10) {
    h = (h << 1) | (hash & 1);
    hash = hash >> 1;
    s = (s << 1) | (hash & 1);
    hash = hash >> 1;
    l = (l << 1) | (hash & 1);
    hash = hash >> 1;
    i = i + 1;
  }
  var h = (h * 360) / 1024;
  var s = ((s * 25) / 1024) + 75;
  var l = ((l * 25) / 1024) + 50;
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function nthIndexOf(needle, haystack, n) {
  var pos = 0;
  var i = 0;
  while ((n >= i) && (pos > -1)) {
    pos = haystack.indexOf(needle, pos);
    if (pos > -1) {
      pos = pos + 1;
    }
    i = i + 1;
  }
  return pos;
}

function getPathComponents(url, n) {
  var i = nthIndexOf('/', url, n);
  if (i < 0) {
    i = url.length + 1;
  }
  return url.substring(0, i - 1);
}

function applyColor(elem, color1, color2) {
  if (!elem) {
    return 0
  }
  elem.style.backgroundColor = color1;
  elem.style.backgroundImage = 'linear-gradient(45deg,' + color1 + ',' + color2 + ')';
}

function init() {
  var color1 = getHashColor(getPathComponents(window.location.href, 3));
  var color2 = getHashColor(getPathComponents(window.location.href, 4));

  // GitHub
  applyColor(document.getElementById('repository-container-header'), color1, color2);
  applyColor(document.getElementsByClassName('js-header-wrapper')[0], color1, color2);
  applyColor(document.getElementsByClassName('footer')[0], color1, color2);

  // GitLab
  applyColor(document.getElementsByClassName('top-bar-fixed')[0], color1, color2);

  // Codeberg
  applyColor(document.getElementById('navbar'), color1, color2);
  applyColor(document.getElementsByClassName('page-footer')[0], color1, color2);
}

init();
})();
