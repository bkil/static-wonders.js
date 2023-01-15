// ==UserScript==
// @name        bugs.chromium.org noJS load issue
// @author      bkil
// @description Monorail issue tracker
// @namespace   bkil.hu
// @match       https://bugs.chromium.org/*
// @grant       none
// @version     2023.01.02
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

const main = () => {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    console.log('missing id from URI query');
    return;
  }
  const config = readConfig();
  if (!config) {
    console.log('missing config object in HTML body');
    return;
  }

  addStyle();
  const div = document.createElement('div');
  document.body.prepend(div);
  div.innerText = 'Fetching comments...';

  fetchComments(
    config,
    id,
    (s) => showComments(div, s),
    (s, code) => div.innerText = `Fetch failed ${code}\n${s}`
  );
};

const readConfig = () => {
  const r = /^\s*window\.CS_env = /;
  const s =
    Array.from(document.querySelectorAll('script'))
    .find(s => r.test(s.textContent))
    ?.textContent.replace(r, '')
    .replace(/;\s*$/, '')
    .replace(/"/g, '\"')
    .replace(/'/g, '"')
    .replace(/(\\)x(..)/g, '$1u00$2')
    .replace(/\\([`$'])/g, '$1')
    .replace(/,\s*}/g, '}')
    ?? null
    ;

  try {
    return JSON.parse(s);
  } catch (e) {
    console.log(`${e}\n${s}`);
    return null;
  }
};

const fetchComments = (config, id, ok, err) => {
  const x = new XMLHttpRequest();
  x.open('POST', `${config.absoluteBaseUrl}/prpc/monorail.Issues/ListComments`);
  x.onload = (e) => {
    if ((x.status >= 200) && (x.status <= 299)) {
      ok(x.responseText);
    } else {
      err(x.responseText, x.status);
    }
  };
  x.onerror = (e) => {
    err(x.responseText, x.status);
    console.log(e);
  };
  x.ontimeout = x.onerror;
  x.timeout = 10000;
  x.setRequestHeader('x-xsrf-token', config.token);
  x.setRequestHeader('accept', 'application/json');
  x.setRequestHeader('content-type', 'application/json');
  const data = {
    issueRef: {
      localId: id,
      projectName: config.projectName
    }
  };
  x.send(JSON.stringify(data));
};

const showComments = (cont, str) => {
  let json;
  try {
    json = JSON.parse(str.replace(/^[^{]*/, ''));
  } catch (e) {
    div.innerText = `${e}\n${str}`;
    return;
  }

  cont.innerText = '';
  const div = document.createElement('div');
  cont.appendChild(div);

  const details = document.createElement('details');
  const pre = document.createElement('pre');
  pre.innerText = JSON.stringify(json, null, 2);
  details.appendChild(pre);

  const summary = document.createElement('summary');
  summary.textContent = 'Show JSON source';
  details.appendChild(summary);
  cont.appendChild(details);

  (json?.comments ?? []).forEach(comment => {
    const c = document.createElement('div');
    c.className = 'comment';
    if (comment.sequenceNum) {
      c.id = `c${comment.sequenceNum}`;
    }

    if (comment.timestamp || comment.sequenceNum) {
      const time = document.createElement('span');
      time.className = 'header';
      const a = document.createElement('a');
      a.textContent = comment.timestamp ? new Date(comment.timestamp * 1000).toLocaleString() : comment.sequenceNum;
      if (comment.sequenceNum) {
        a.href = `#${c.id}`;
      }
      time.appendChild(a);
      c.appendChild(time);
    }

    const displayName = comment?.commenter?.displayName;
    if (displayName) {
      const user = document.createElement('span');
      user.className = 'header';
      user.textContent = displayName;
      c.appendChild(user);
    }

    if (comment.isDeleted) {
      const deleted = document.createElement('span');
      deleted.className = 'header';
      deleted.textContent = '=deleted';
      c.appendChild(deleted);
    }

    if (comment.amendments) {
      const action = document.createElement('span');
      action.className = 'header';
      action.textContent = comment.amendments.map(a =>
        `${a.fieldName ?? '?'}=${a.newOrDeltaValue}`
      ).join(', ');
      c.appendChild(action);
    }

    if (comment.content) {
      const body = document.createElement('div');
      body.innerText = comment.content;
      c.appendChild(body);
    }

    if (comment.attachments?.length) {
      const attachments = document.createElement('ul');
      comment.attachments.forEach(f => {
        const item = document.createElement('li');
        const a = document.createElement('a');
        const file = f.filename ?? f.attachmentId ?? 'attachment.txt';
        a.textContent = `${file} (${f.contentType ?? ''} ${f.size ? `${f.size} bytes` : ''})`;
        a.href = f.downloadUrl ?? f.viewUrl ?? '';
        a.target = '_blank';
        a.rel = 'noreferrer';
        a.download = file;
        item.appendChild(a);
        attachments.appendChild(item);
      });
      c.appendChild(attachments);
    }

    div.appendChild(c);
  });

  if (window.location.hash) {
    window.location = window.location;
  }
};

const addStyle = () => {
  const s = document.createElement('style');
  s.innerText = `
    html {
      overflow-wrap: break-word;
    }

    pre {
      white-space: pre-wrap;
    }

    .comment {
      border-bottom: 1px solid;
    }

    .header {
      padding: 1em;
    }

    .comment:target {
      margin-left: 1em;
      padding-left: 1em;
      border-left: 1px solid;
    }

    .comment:target span {
      font-weight: bolder;
    }
  `;
  document.head.appendChild(s);
};

main();
})();
