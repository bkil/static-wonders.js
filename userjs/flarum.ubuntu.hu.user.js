// ==UserScript==
// @name        ubuntu.hu (Flarum) noJS basic content + JSON
// @author      bkil
// @description Development tool to analyze what is in the HTML
// @namespace   bkil.hu
// @match       https://ubuntu.hu/blog*
// @grant       none
// @version     2022.11.1
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
  result.className = 'userscript';

  const json = getJson();

  try {
    addRenderedContent(result, json);
  } catch (e) {
    throw e;
  } finally {
    addDebugInfo(result, json);

    let container = document.getElementById('app');
    if (!container) {
      container = document.body;
    }
    container.appendChild(result);

    addStyle();
  }
}

function addStyle() {
  const style = document.createElement('style');
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
  const payload = document.getElementById('flarum-json-payload');
  if (!payload) {
    return "error: can't find element with ID 'flarum-json-payload'";
  }

  try {
    return JSON.parse(payload.textContent);
  } catch (e) {
    return e + "\n" + line;
  }
}

function addRenderedContent(result, json) {
  if (typeof json === 'string') {
    return
  }
  const all = document.createElement('div');

  let posts = {};
  var included = json.apiDocument.included;
  for (var i = 0; i < included.length; i++) {
    if (included[i].type === 'posts') {
      posts[included[i].id] = included[i].attributes.contentHtml;
    }
  }

  const doc = json.apiDocument.data;
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
  const entry = document.createElement('div');
  entry.className = 'post';

  const a = document.createElement('a');
  a.href = 'blog/' + post.attributes.slug;
  a.innerText = post.attributes.title;
  entry.appendChild(a);

  const time = document.createElement('span');
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
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.innerText = '(click to see debug JSON)';
  details.appendChild(summary);

  addTitleDescription(details);
  addJson(details, json);
  result.appendChild(details);
}

function addTitleDescription(result) {
  const title = document.head.getElementsByTagName('title')[0];
  if (title) {
    var h1 = document.createElement('h1');
    h1.innerText = title.innerText;
    result.appendChild(h1);
  }

  const meta = document.head.querySelector('meta[name="description"]');
  if (meta) {
    const cite = document.createElement('blockquote');
    cite.innerText = meta.content;
    result.appendChild(cite);
  }
}

function addJson(result, json) {
  const code = document.createElement('pre');
  if (typeof json === 'string') {
    code.innerText = json;
  } else {
    code.innerText = JSON.stringify(json, null, 2);
  }
  result.appendChild(code);
}

})();
