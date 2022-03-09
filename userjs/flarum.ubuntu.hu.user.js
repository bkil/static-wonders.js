// ==UserScript==
// @name        ubuntu.hu (Flarum) noJS basic content + JSON
// @author      bkil
// @description Development tool to analyze what is in the HTML
// @namespace   bkil.hu
// @match       https://ubuntu.hu/blog*
// @grant       none
// @version     2022.3.8
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
  var result = document.createElement('div');
  result.className = 'userscript';

  var json = getJson();
  addRenderedContent(result, json);

  addDebugInfo(result, json);

  var container = document.getElementById('app');
  if (!container) {
    container = document.body;
  }
  container.appendChild(result);

  addStyle();
}

function addStyle() {
  var style = document.createElement('style');
  style.className = 'userscript';
  style.innerText =
    'pre { white-space: pre-wrap; overflow-x: auto; }' +
    'summary { cursor: pointer; }' +
    'blockquote { border-left-style: solid; padding-left: 1em; }' +
    '.userscript .post { border-bottom: 1px solid }' +
    '.userscript .time { margin-left: 2em }' +
    '#app { min-height: initial; padding-bottom: initial; }'
  ;
  document.body.appendChild(style);
}

function getJson() {
  var scripts = document.getElementsByTagName('script');
  var prefix = ' flarum.core.app.load(';

  var script = '';
  var prefixPos = -1;
  for (var i = 0; (i < scripts.length) && (prefixPos < 0); i++) {
    script = scripts[i].text;
    prefixPos = script.indexOf(prefix);
  }
  if (prefixPos < 0) {
    return '';
  }

  var line = script
    .substr(prefixPos + prefix.length)
    .replace(/\);\n(.|\n)*$/, '');

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}

function addRenderedContent(result, json) {
  if (typeof json === 'string') {
    return
  }
  var all = document.createElement('div');

  var included = json.apiDocument.included;
  var posts = {};
  for (var i = 0; i < included.length; i++) {
    if (included[i].type === 'posts') {
      posts[included[i].id] = included[i].attributes.contentHtml;
    }
  }

  var doc = json.apiDocument.data;
  if (doc.length) {
    for (var i = 0; i < doc.length; i++) {
      addPost(all, doc[i], posts);
    }
  } else {
    addPost(all, doc, posts);
  }

  result.appendChild(all);
}

function addPost(result, post, posts) {
  var entry = document.createElement('div');
  entry.className = 'post';

  var a = document.createElement('a');
  a.href = 'blog/' + post.attributes.slug;
  a.innerText = post.attributes.title;
  entry.appendChild(a);

  var time = document.createElement('span');
  time.className = 'time';
  time.innerText = post.attributes.lastPostedAt;
  entry.appendChild(time);

  var body = document.createElement('div');
  var id = post.relationships.firstPost.data.id;
  body.innerHTML = posts[id];
  entry.appendChild(body);

  result.appendChild(entry);
}


function addDebugInfo(result, json) {
  var details = document.createElement('details');
  var summary = document.createElement('summary');
  summary.innerText = '(click to see debug JSON)';
  details.appendChild(summary);

  addTitleDescription(details);
  addJson(details, json);
  result.appendChild(details);
}

function addTitleDescription(result) {
  var title = document.head.getElementsByTagName('title')[0];
  if (title) {
    var h1 = document.createElement('h1');
    h1.innerText = title.innerText;
    result.appendChild(h1);
  }

  var meta = document.head.querySelector('meta[name="description"]');
  if (meta) {
    var cite = document.createElement('blockquote');
    cite.innerText = meta.content;
    result.appendChild(cite);
  }
}

function addJson(result, json) {
  var code = document.createElement('pre');
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    code.innerText = JSON.stringify(json, null, 2);
  }
  result.appendChild(code);
}

})();
