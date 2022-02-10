// ==UserScript==
// @name        indiegogo.com noJS content JSON display
// @author      bkil
// @description 2/3/2022, 10:34:58 AM
// @namespace   bkil.hu
// @match       https://*.indiegogo.com/*
// @grant       none
// @version     2022.2.9
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
main();

function main() {
  var result = document.createElement('div');
  addTitleDescription(result);
  addJson(result);
  document.body.appendChild(result);

  addStyle();
}

function addStyle() {
  var style = document.createElement('style');
  style.innerText =
    'pre { white-space: pre-wrap; overflow-x: auto; }'
  ;
  document.body.appendChild(style);
}

function addJson(result) {
  var code = document.createElement('pre');
  var json = getJson();
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    code.innerText = JSON.stringify(json, null, 2);
  }

  result.appendChild(code);
}

function addTitleDescription(result) {
  var title = document.head.getElementsByTagName('title')[0];
  if (title) {
    var h1 = document.createElement('h1');
    h1.innerText = title.innerText;
    result.appendChild(h1);
  }

  var meta = document.head.querySelector('meta[property="og:description"]');
  if (meta) {
    var cite = document.createElement('blockquote');
    cite.innerText = meta.content;
    result.appendChild(cite);
  }
}

function getJson() {
  var scripts = document.getElementsByTagName('script');
  var prefix = "\n//<![CDATA[\nwindow.gon={};";

  var script = '';
  var prefixPos = -1;
  for (var i = 0; (i < scripts.length) && (prefixPos !== 0); i++) {
    script = scripts[i].text;
    prefixPos = script.indexOf(prefix);
  }
  if (prefixPos !== 0) {
    return '';
  }

  var line = '{' + script
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
