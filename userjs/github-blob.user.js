// ==UserScript==
// @name        github.com raw blob noJS
// @author      bkil
// @description Minimal viewer of files on GitHub
// @namespace   bkil.hu
// @match       https://github.com/*/blob/*
// @match       https://github.com/*/tree/*
// @grant       none
// @version     2023.9.2
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

  if (j && j.payload) {
    if (j.payload.blob && j.payload.blob.rawBlob) {
      res.appendChild(getPre(j.payload.blob.rawBlob));
    } else if (j.payload.blob && j.payload.blob.rawLines) {
      res.appendChild(getPre(j.payload.blob.rawLines.join('\n')));
    } else if (j.payload.blob && j.payload.blob.richText) {
      processRich(res, j.payload.blob.richText);
    } else {
      if (j.payload.fileTree && j.payload.fileTree['']) {
        processDirectory(res, j.payload.fileTree[''].items);
      }
      if (j.payload.tree) {
        res.appendChild(document.createElement('hr'));
        processDirectory(res, j.payload.tree.items);
      }
    }
  }

  var details = document.createElement('details');
  var summary = document.createElement('summary');
  summary.textContent = 'Click to debug JSON';
  details.appendChild(summary);
  details.appendChild(getPre(JSON.stringify(j, null, 2)));
  res.appendChild(details);
}

function processRich(out, text) {
  var div = document.createElement('div');
  div.style.wordWrap = 'anywhere';
  div.style.overflowWrap = 'anywhere';
  div.innerHTML = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/&lt;span class=&quot;[0-9a-z-]+&quot;&gt;/g, '')
    .replace(/&lt;\/span&gt;/g, '')
    .replace(/&lt;svg(?: (?:[^&]|&amp;|&quot;)*?)?&gt;.*?&lt;\/svg&gt;/g, ' svg ')
    .replace(/&lt;g-emoji class=&quot;g-emoji&quot; alias=&quot;\w+&quot; fallback-src=&quot;[^&]+&quot;&gt;([^&]+?)&lt;\/g-emoji&gt;/g, '$1')
    .replace(/&lt;(\/?(?:h[1-6]|strong|em|b|i|details|summary|pre|code|blockquote|ul|ol|li|br|hr|p|table|thead|tbody|th|tr|td|sub|sup))(?: align=&quot;center&quot;| tabindex=&quot;-1&quot;| dir=&quot;auto&quot;| start=&quot;[0-9]+&quot;|( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;)*&gt;/g, '<$1$2$3>')
    .replace(/&lt;a( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;&gt;(.+?)&lt;\/a&gt;/g, '<a$1$2 href="#$2"> link </a> $3')
    .replace(/&lt;a(?:( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;)?(?: (?:[^&]|&amp;|&quot;)*?)? href=&quot;#((?:[^&]|&amp;)*)&quot;(?:[^&]|&amp;|&quot;)*?&gt;(.+?)&lt;\/a&gt;/g, '<a$1$2 href="#$3">$4</a>')
    .replace(/&lt;a(?:( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;)?(?: (?:[^&]|&amp;|&quot;)*?)? href=&quot;((?:[^&]|&amp;)*)&quot;(?:[^&]|&amp;|&quot;)*?&gt;(.+?)&lt;\/a&gt;/g, '<a$1$2 href="$3" target=_blank rel=noreferrer>$4</a>')
    .replace(/&amp;lt;/g, '&lt;')
    .replace(/&amp;gt;/g, '&gt;')
    .replace(/&amp;quot;/g, '&quot;')
    .replace(/&amp;amp;/g, '&amp;')
    ;
  out.appendChild(div);
}

function processDirectory(out, dir) {
  if (!Array.isArray(dir)) {
    return
  }
  var pre = window.location.href.replace(/^(https:\/\/github\.com(?:\/[^\/]+){2}).*$/, '$1');
  var ref = window.location.href.replace(/^https:\/\/github\.com(?:\/[^\/]+){3}\/([^\/]+)\/.*$/, '$1');

  var list = document.createElement('ul');
  dir.forEach(function(item) {
    var a = document.createElement('a');
    if (item.contentType === 'directory') {
      a.href = pre + '/tree/' + ref + '/' + item.path;
      a.textContent = item.path + '/';
    } else {
      a.href = pre + '/blob/' + ref + '/' + item.path;
      a.textContent = item.path;
    }
    var li = document.createElement('li');
    li.appendChild(a);
    list.appendChild(li);
  });
  out.appendChild(list);
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
