// ==UserScript==
// @name        ubuntu.hu (Flarum) noJS basic content + JSON
// @author      bkil
// @description Development tool to analyze what is in the HTML
// @namespace   bkil.hu
// @match       https://ubuntu.hu/blog*
// @grant       none
// @version     2022.11.19
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
    '.userscript .time, .userscript .user { margin-left: 2em }' +
    '.userscript .thread, .userscript .action { margin-left: 2em; font-size: smaller; }' +
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
  let users = {};
  json.apiDocument.included.forEach(i => {
    if (i.type === 'posts') {
      posts[i.id] = i;
    } else if (i.type === 'users') {
      users[i.id] = i;
    }
  });

  const doc = json.apiDocument.data;
  if (doc.length) {
    for (var i = 0; i < doc.length; i++) {
      addPost(all, doc[i], posts, users);
    }
  } else {
    addPost(all, doc, posts, users);
  }

  result.appendChild(all);
}

function addPost(result, post, posts, users) {
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

  const user = document.createElement('span');
  user.className = 'user';
  user.textContent = users[post.relationships.user.data.id].attributes.username;
  entry.appendChild(user);

  const body = document.createElement('div');
  const first = post.relationships.firstPost.data.id;
  body.innerHTML = posts[first].attributes.contentHtml;
  entry.appendChild(body);
  result.appendChild(entry);

  if (post.relationships.posts) {
    addReplies(result, first, post.relationships.posts.data, posts, users);
  }
}

function addReplies(result, first, allReplies, posts, users) {
  const replies = allReplies.filter(p => (p.type === 'posts') && (p.id !== first));
  if (!replies.length) {
    return;
  }

  const thread = document.createElement('div');
  thread.className = 'thread';

  replies.forEach(reply => {
    const p = posts[reply.id];
    const entry = document.createElement('div');
    entry.className = 'post';

    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = p.attributes.createdAt;
    entry.appendChild(time);

    const user = document.createElement('span');
    user.className = 'user';
    user.textContent = users[p.relationships.user.data.id].attributes.username;
    entry.appendChild(user);

    if (p.attributes.contentType === 'comment') {
      const body = document.createElement('div');
      body.innerHTML = p.attributes.contentHtml;
      entry.appendChild(body);
    } else {
      const action = document.createElement('span');
      action.className = 'action';
      action.textContent = p.attributes.contentType + ' ' + JSON.stringify(p.attributes.content);
      entry.appendChild(action);
    }

    thread.appendChild(entry);
  });

  result.appendChild(thread);
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
