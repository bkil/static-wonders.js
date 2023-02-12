// ==UserScript==
// @name        shadertoy.com noJS source
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://shadertoy.com/view/*
// @match       https://www.shadertoy.com/view/*
// @grant       none
// @version     2023.02.01
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(() => {
'use strict';

const main = () => {
  addStyle();
  const path = document.location.pathname;
  const id = encodeURIComponent(path.substr(path.lastIndexOf('/') + 1));
  addSource(id);
  addComments(id);
}

const addSource = (id) => {
  const div = document.createElement('div');
  div.className = 'userjs-source';
  document.getElementById('editor').appendChild(div);

  fetchJson('/shadertoy', `s=%7B%22shaders%22%3A%5B%22${id}%22%5D%7D`, (j) => {
    const source = document.createElement('pre');
    div.appendChild(source);

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '(click to view JSON)';
    details.appendChild(summary);
    const json = document.createElement('pre');
    json.textContent = JSON.stringify(j, null, 2)
    details.appendChild(json);
    div.appendChild(details);

    source.textContent = j[0]?.renderpass[0]?.code;
  }, () => {
    div.textContent = '(failed to fetch source)';
  });
};

const addComments = (id) => {
  const div = document.createElement('div');
  document.getElementById('comments').appendChild(div);

  fetchJson('/comment', `s=${id}`, (j) => {
    const comments = document.createElement('div');
    div.appendChild(comments);

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '(click to view JSON)';
    details.appendChild(summary);
    const json = document.createElement('pre');
    json.textContent = JSON.stringify(j, null, 2)
    details.appendChild(json);
    div.appendChild(details);

    j?.date.forEach((date, i) => {
      const comment = document.createElement('div');
      comment.className = 'comment'; // CSS

      comment.innerHTML = `
<div><span class=userPictureSmall></span></div>
<div class=commentContent><span class=user>${hEscape(j?.username[i] ?? '')}</span>,
${new Date(1000 * parseInt(date)).toLocaleString()}<br>${hEscape(j?.text[i] ?? '')}</div>
<div class=uiDivBUtton></div>
      `;

      comments.appendChild(comment);
    });
  }, () => {
    div.textContent = '(failed to fetch comments)';
  });
};

const hEscape = (s) => {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
  ;
};

const fetchJson = (url, post, ok, err) => {
  fetch(url, post, (data) => {
    if (data) {
      let j;
      try {
        j = JSON.parse(data);
      } catch (e) {
        console.log(e);
        err();
        return;
      }
      ok(j);
    } else {
      err();
    }
  }, err);
};

const fetch = (url, post, ok, err) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);

  xhr.onerror = (e) => {
    console.log(e);
    err();
  }

  xhr.ontimeout = (e) => xhr.onerror(e);

  xhr.onload = () => {
    if ((xhr.status >= 200) && (xhr.status <= 299)) {
      ok(xhr.responseText);
    } else {
      console.log(xhr);
      err();
    }
  }

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.timeout = 10000;
  xhr.send(post);
};

const addStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    html {
      overflow-wrap: break-word;
    }

    pre {
      white-space: pre-wrap;
      overflow-x: auto;
    }

    .userjs-source,
    .userjs-source details {
      display: contents;
    }
  `;
  document.head.appendChild(style);
}

main();
})();
